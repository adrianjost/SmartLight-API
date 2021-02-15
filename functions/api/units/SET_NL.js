const namedColors = require("./colorDictionary");
const { db } = require("../../initialize");

// eslint-disable-next-line no-constant-condition
const log = false ? console.log : () => {};

function extractUnitName(req) {
	return new Promise((resolve, reject) => {
		let sanitisedString = req.body.payload
			.replace(/bitte/g, "")
			.replace(/mache[n]?/g, "")
			.trim();

		const query = /(?:vor?[nm]|[ai][nm]|zum|de[nm]){1} (?:i[nm] )?(?:(?:unsere?|meine)[nm]? )?(\S*)/gi;
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

function getUnitByName(req) {
	const collection = db.collection("units");
	log("objectName", req.body.objectName);
	const findByName = collection
		.where("created_by", "==", req.auth.userid)
		.where("name", "==", req.body.objectName)
		.get();
	const findByTag = collection
		.where("created_by", "==", req.auth.userid)
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
			req.body.payload.toUpperCase().includes(color.name.toUpperCase())
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
					color: newColor.value(req.result.unit.state.color, req.body.payload),
				};
			}
			return resolve(req);
		}

		// no color found, check for saved gradients
		// TODO [#11]: check for saved gradients and load them if found
		/*
		const findSavedGradients = db
			.collection("states")
			.where("type", "==", "gradient")
			.where("created_by", "==", req.auth.userid)
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
	const SUPPORTED_LANG = ["de"];
	if (!SUPPORTED_LANG.includes(req.body.lang || "de")) {
		res.status(400);
		res.send(
			`language is not supported. Try one of: ${SUPPORTED_LANG.join(", ")}`
		);
		return false;
	}
	if (!req.body.payload) {
		res.status(400);
		res.send(`no payload given`);
		return false;
	}
	req.result = {}; // storage for promise results
	return Promise.resolve(req)
		.then(extractUnitName)
		.then(getUnitByName)
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

module.exports = handleSpeachRequest;
