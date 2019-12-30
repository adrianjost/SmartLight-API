const functions = require("firebase-functions");
const express = require("express");
const namedColors = require("./colorDictionary.js");
const { db } = require("../initialize");

// INIT
const app = express();

// eslint-disable-next-line no-constant-condition
const log = false ? console.log : () => {};

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.get("/time", (req, res) => {
	res.send(`server timestamp: ${Date.now()}`);
});

// FUNCTIONS
function authenticateUser(req) {
	// Authenticate user using secret token
	return db
		.collection("users")
		.doc(req.body.uid)
		.get()
		.then((doc) => {
			if (doc.exists && doc.data().api_token === req.body.secret) {
				return req;
			}
			throw new Error(
				JSON.stringify({
					code: 401,
					message: `wrong uid or secret`,
				})
			);
		});
}

function extractObjectName(req) {
	return new Promise((resolve, reject) => {
		let sanitisedString = req.body.textString
			.replace(/bitte/g, "")
			.replace(/mache[n]?/g, "")
			.trim();

		const query = /(?:vor?[nm]|[ai][nm]|zum){1} (?:i[nm] )?(?:(?:unsere?|meine)[nm]? )?(\S*)/gi;
		const match = query.exec(sanitisedString);

		if (!match) {
			return reject(
				new Error(JSON.stringify({ code: 404, message: "can't decode object" }))
			);
		} else {
			req.body.objectName = match[1];
			return resolve(req);
		}
	});
}

function getObjectByName(req) {
	const collection = db.collection("units");

	const findByName = collection
		.where("created_by", "==", req.body.uid)
		.where("name", "==", req.body.objectName)
		.get();

	log("objectName", req.body.objectName);
	const findByTag = collection
		.where("created_by", "==", req.body.uid)
		.where("tags", "array-contains", req.body.objectName)
		.get();
	return Promise.all([findByName, findByTag]).then(
		([unitDocByName, unitDocByTag]) => {
			// Prefer name over tag
			const unitDoc = unitDocByName.empty ? unitDocByTag : unitDocByName;
			if (unitDoc.empty) {
				throw new Error(
					JSON.stringify({
						code: 404,
						message: `object "${req.body.objectName}" not found`,
					})
				);
			}
			let docs = [];
			unitDoc.forEach((doc) => {
				docs.push(doc.data());
			});
			req.result.unit = docs[0];
			log("found", req.result.unit);
			return req;
		}
	);
}

function getNewColor(req) {
	return new Promise((resolve, reject) => {
		// translate color (directly)
		const newColor = namedColors.list.find((color) =>
			req.body.textString.toUpperCase().includes(color.name.toUpperCase())
		);
		if (newColor) {
			if (typeof newColor.value === "string") {
				req.result.newState = { color: newColor.value };
			}
			if (typeof newColor.value === "function") {
				if (!req.result.unit.state.color) {
					reject(
						new Error(
							JSON.stringify({
								code: 500,
								message: `${req.body.colorName} - I can only manipulate colors`,
							})
						)
					);
				}
				req.result.newState = {
					color: newColor.value(
						req.result.unit.state.color,
						req.body.textString
					),
				};
			}
			return resolve(req);
		}

		// no color found, check for saved gradients
		// TODO: check for saved gradients and load them if found
		/*
		const findSavedGradients = db
			.collection("states")
			.where("type", "==", "gradient")
			.where("created_by", "==", req.body.uid)
			.get();

		log("findSavedGradients", findSavedGradients);
		*/

		return reject(
			new Error(
				JSON.stringify({
					code: 500,
					message: `${req.body.colorName} - no (hex) color or gradient found`,
				})
			)
		);
	});
}

function applyNewColor(req) {
	return db
		.collection("units")
		.doc(req.result.unit.id)
		.update({ state: req.result.newState })
		.then(() => req);
}

function handleSpeachRequest(req, res) {
	// error handling
	if (!req.body.uid) {
		res.status(400);
		res.send(`no uid given`);
		return false;
	}
	if (!req.body.secret) {
		res.status(400);
		res.send(`no secret given`);
		return false;
	}
	if (!req.body.textString) {
		res.status(400);
		res.send(`no textString given`);
		return false;
	}

	req.result = {}; // storage for promise results
	//log("#1");
	return authenticateUser(req)
		.then(extractObjectName)
		.then(getObjectByName)
		.then(getNewColor)
		.then(applyNewColor)
		.then((req) => {
			res.json({
				status: 200,
				lamp: req.result.objectName,
				newColor: {
					name: req.body.colorName,
					hex: req.result.newState,
				},
			});
			return true;
		})
		.catch((error) => {
			try {
				const errorObject = JSON.parse(error.message);
				res.status(errorObject.code);
				res.send(`ERROR: ${errorObject.message}`);
			} catch (parseError) {
				res.status(500);
				res.send(`ERROR: ${JSON.stringify(error.message)}`);
			}
			return res;
		});
}

// set the color of a lamp
app.post("/", handleSpeachRequest);
app.post("/set", handleSpeachRequest);

exports = module.exports = functions.https.onRequest(app);
