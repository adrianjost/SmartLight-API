const functions = require("firebase-functions");
const app = require("restana")();

app.use(require("./middleware/cors"));
app.use(require("./middleware/auth"));

app.get("/time", (req, res) => {
	res.send(`server timestamp: ${Date.now()}`);
});

app.get("/units", require("./units").GET);
app.post("/units/setNL", require("./units").SET_NL);
app.post("/units/:id", require("./units").CREATE);
app.patch("/units/:id", require("./units").PATCH);

exports = module.exports = functions
	.runWith({
		timeoutSeconds: 30,
		memory: "512MB",
	})
	.https.onRequest(app.callback());
