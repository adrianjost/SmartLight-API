const functions = require('firebase-functions');
const express = require('express');
const admin = require("firebase-admin");
const namedColors = require('./colorDictionary.js');

// INIT
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/time', (req, res) => {
  //console.log("send time");
  res.send(`server timestamp: ${Date.now()}`);
});

try {
    const serviceAccount = require('./../../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://smartlight-4861d.firebaseio.com",
        databaseAuthVariableOverride: {
            uid: "assistant-api"
        }
    });
}catch(e) {
    console.error(e)
}

// HELPERS
function raceToSuccess(promises) {
  let numRejected = 0;
  return new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      promise
      .then(resolve)
      .catch((error) => {
        if (++numRejected === promises.length) reject(new Error());
      });
    });
  });
}

// FUNCTIONS
function authenticateUser(req){
  //console.log("#2");
  // Authenticate user using secret token
  return new Promise(((resolve, reject) => {
    db.ref("users/" + req.body.uid + "/secret").once("value", (secretSnap) => {
      const server_secret = secretSnap.val();
      if(server_secret === req.body.secret){
        return resolve(req);
      }
      return reject(new Error(JSON.stringify({code: 401, message: `authentication with secret failed`})));
    });
  }));
}


function extractObject(req) {
  //console.log("#3");
  return new Promise(((resolve, reject) => {
    let sanitisedString = req.body.textString.replace(/bitte/g, "").replace(/mache[n]?/g, "").trim();

    const query = /(?:vor?[nm]|[ai][nm]|zum){1} (?:i[nm] )?(?:(?:unsere?|meine)[nm]? )?(\S*)/gi;
    const match = query.exec(sanitisedString);

    if(!match){
      return reject(new Error(JSON.stringify({code: 404, message:"can't decode object"})));
    }else{
      req.body.objectName = match[1];
      return resolve(req)
    }
  }));
}

function getObjectPathByName(req) {
  //console.log("#4");
  // get lampId by Name
  return new Promise((resolve, reject) => {
    const lookupPaths = [
      `users/${req.body.uid}/groups`,
      `users/${req.body.uid}/lamps`
    ];
    const lookups = lookupPaths.map(async (lookupPath) => {
      const snap = await db.ref(lookupPath)
      .orderByChild("name")
      .equalTo(req.body.objectName)
      .once("value");
      if(snap.val()){
        return {
          objectPath: lookupPath + "/" + Object.keys(snap.val())[0],
        };
      }
      throw new Error('not found');
    });
    return raceToSuccess(lookups).then((object) => {
      req.result.objectPath = object.objectPath;
      return resolve(req);
    }).catch((error) => {
      return reject(new Error(JSON.stringify({code: 404, message: `object "${req.body.objectName}" not found`})));
    });
  });
}

async function getCurrentObjectColor(req){
  //console.log("#5.1")
  req.result.currentColor = (await db.ref( req.result.objectPath + "/current/color").once("value")).val();
  return req;
}

function getNewColor(req) {
  //console.log("#5.2");
  return new Promise(((resolve, reject) => {
    // translate color (directly)
    const newColor = namedColors.list.find(color => req.body.textString.toUpperCase().includes(color.name.toUpperCase()));
    if (newColor) {
      if(typeof newColor.value === "string"){
        req.result.newHexColor =  newColor.value;
      }
      if(typeof newColor.value === "function"){
        req.result.newHexColor = newColor.value(req.result.currentColor, req.body.textString);
      }
      return resolve(req)
    }

    return reject(new Error(JSON.stringify({code: 500, message: `${req.body.colorName} - no hex value for color found`})));
  }));
}

function applyNewColor(req) {
  //console.log("#6");
  // Apply new color to each lamp
  return new Promise((resolve, reject) => {
    // Apply new color to an lamp
    db.ref(req.result.objectPath + "/current")
    .set({
      color: req.result.newHexColor
    })
    .then(() => {
      return resolve(req);
    })
    .catch((error) => {
      return reject(error);
    });
  });
}

const db = admin.database();
// set the color of an lamp
app.post('/set', (req, res) => {
  // error handling
  if(!req.body.uid){       res.status(400); res.send(`no jwt given`);        return false;}
  if(!req.body.secret){    res.status(400); res.send(`no secret given`);     return false;}
  if(!req.body.textString){res.status(400); res.send(`no textString given`); return false;}

  req.result = {}; // storage for promise results
  //console.log("#1");
  return authenticateUser(req)
  .then( extractObject )
  .then( getObjectPathByName )
  .then( getCurrentObjectColor )
  .then( getNewColor )
  .then( applyNewColor )
  .then( (req) => {
    res.json({
      status: 200,
      lamp: req.result.objectName,
      newColor: {
        name: req.body.colorName,
        hex: req.result.newHexColor
      }
    });
    return true
  })
  .catch((error) => {
    //console.error(req.body, error);
    try {
      error = JSON.parse(error.toString().replace("Error: ",""));
      res.status(error.code);
      res.send(`error: ${error.message}`)
    }
    catch(parseError) {
      res.status(500);
      res.send(`${JSON.stringify(error)}\n${error}`);
    }
    return false;
  });
});

exports = module.exports = functions.https.onRequest(app);