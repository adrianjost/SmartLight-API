module.exports = {
	testMatch: ["**/(*.)unit.js"],
	moduleFileExtensions: ["js"],
	coverageDirectory: "<rootDir>/coverage",
	snapshotResolver: "<rootDir>/snapshotResolver.js",
	collectCoverage: true,
	collectCoverageFrom: ["<rootDir>/functions/**/*.js"],
};
