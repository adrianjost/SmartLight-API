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

const SET_NL = require("./SET_NL");

const SET_ID = async (req, res) => {
	const unitRef = db.collection("units").doc(req.params.id);
	const unit = await unitRef.get();
	const unitData = unit.exists ? unit.data() : undefined;
	if (unitData && unitData.created_by !== req.auth.userid) {
		res.status(404);
		return res.send("unit not found");
	}
	await unitRef.set(req.body.payload, { merge: true });
	res.send({ status: 200 });
};

const GET_ID = async (req, res) => {
	const unitRef = db.collection("units").doc(req.params.id);
	const unit = await unitRef.get();
	const unitData = unit.exists ? unit.data() : undefined;
	if (unitData && unitData.created_by !== req.auth.userid) {
		res.status(404);
		return res.send("unit not found");
	}
	res.send({ status: 200, data: unitData });
};

const DELETE_ID = async (req, res) => {
	const unitRef = db.collection("units").doc(req.params.id);
	const unit = await unitRef.get();
	const unitData = unit.exists ? unit.data() : undefined;
	if (unitData && unitData.created_by !== req.auth.userid) {
		res.status(404);
		return res.send("unit not found");
	}
	await unitRef.delete();
	res.send({ status: 200 });
};

module.exports = {
	GET,
	SET_NL,
	GET_ID,
	SET_ID,
	DELETE_ID,
};
