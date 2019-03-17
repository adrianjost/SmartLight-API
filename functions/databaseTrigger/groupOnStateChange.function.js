const functions = require("firebase-functions");
const { db } = require("../initialize");

exports = module.exports = functions.database
	.ref("/users/{userId}/groups/{groupId}/current")
	.onUpdate((change, context) => {
		const before = change.before.val();
		const after = change.after.val();

		if (before === after) {
			return null;
		}

		const newState = after;
		return db
			.ref(
				`/users/${context.params.userId}/groups/${context.params.groupId}/lamps`
			)
			.once("value")
			.then((lampsSnap) => {
				let lampPromises = [];
				if (lampsSnap.val()) {
					const lamps = lampsSnap.val();
					lampPromises = lamps.map((lampId) => {
						return db
							.ref(`/users/${context.params.userId}/lamps/${lampId}/current`)
							.set(newState);
					});
				}
				return Promise.all(lampPromises);
			});
	});
