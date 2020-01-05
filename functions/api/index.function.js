const functions = require("firebase-functions");
const app = require("restana")();

app.use(require("./middleware/cors"));
app.use(require("./middleware/auth"));

app.get("/time", (req, res) => {
	res.send(`server timestamp: ${Date.now()}`);
});

app.get("/units", require("./units").GET);
app.post("/units/setNL", require("./units").SET_NL);
app.get("/units/:id", require("./units").GET_ID);
// app.post("/units/:id", require("./units").SET_ID);
app.patch("/units/:id", require("./units").SET_ID);
app.delete("/units/:id", require("./units").DELETE_ID);

exports = module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest(app.callback());
