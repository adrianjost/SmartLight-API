const admin = require("firebase-admin");

try {
	admin.initializeApp({
		credential: admin.credential.applicationDefault(),
		databaseURL: "https://aj-smartlight.firebaseio.com",
	});
} catch (e) {
	console.error(e);
}

const db = admin.firestore();

module.exports = {
	db,
};
