const { db } = require("../../initialize");

const GET = async (req, res) => {
	const docs = await db
		.collection("units")
		.where("created_by", "==", req.auth.userid)
		.get();
	const units = [];
	docs.forEach((doc) => {
		units.push(doc.data());
	});
	res.send({ status: 200, data: units });
};

const SET = async (req, res) => {
	await db
		.collection("units")
		.doc(req.params.id)
		.set(req.body, { merge: true });
	res.send({ status: 200 });
};

const SET_NL = require("./SET_NL");

module.exports = {
	GET,
	CREATE: SET,
	PATCH: SET,
	SET_NL,
};
