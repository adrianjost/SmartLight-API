const { db } = require("../../initialize");

module.exports = async (req, res, next) => {
	const userid = req.headers["authorization-userid"] || req.body.userid;
	if (!userid) {
		res.status(400);
		return res.send(`no uid given`);
	}
	const apiToken = req.headers["authorization-token"] || req.body.token;
	if (!apiToken) {
		res.status(400);
		return res.send(`no auth token given`);
	}
	const userRef = db.collection("users").doc(userid);
	const user = await userRef.get();
	const userData = user.exists ? user.data() : undefined;
	if (!userData || userData.api_token !== apiToken) {
		res.status(401);
		return res.send(`Invalid Credentials`);
	}
	req.auth = {
		userid,
		token: apiToken,
	};
	return next();
};
