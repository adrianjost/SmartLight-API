module.exports = {
	testMatch: ["**/(*.)unit.js"],
	coverageDirectory: "<rootDir>/coverage",
	snapshotResolver: "<rootDir>/snapshotResolver.js",
	collectCoverageFrom: ["<rootDir>/functions/**/*.js"],
};
