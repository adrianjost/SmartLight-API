const functions = require("firebase-functions");
const { db } = require("./initialize");

// eslint-disable-next-line no-constant-condition
const log = false ? console.log : () => {};

function handleUnitChange(change) {
	log("handleUnitChange invoked");
	const unitBefore = change.before.data();
	if (unitBefore.type !== "GROUP") {
		// only changes on groups are handled by this function
		log("but changed unit is not a group");
		return false;
	}
	const unitAfter = change.after.data();

	const stateBefore = unitBefore.state;
	const stateAfter = unitAfter.state;

	if (JSON.stringify(stateBefore) === JSON.stringify(stateAfter)) {
		// only state changes get processed
		log("but unit state hasn't changed");
		return false;
	}

	log("updating lamps...");
	const lampUpdates = unitAfter.lamps.map((lampId) =>
		db
			.collection("units")
			.doc(lampId)
			.update({ state: stateAfter })
	);
	return Promise.all(lampUpdates);
}

exports = module.exports = functions.firestore
	.document("units/{unitId}")
	.onUpdate(handleUnitChange);
