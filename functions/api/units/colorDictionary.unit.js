const {
	extractPercentage,
	AdjustColorBrightness,
	AdjustColorTemperature,
	lighten,
	darken,
	heatUp,
	coolDown,
	list,
} = require("./colorDictionary");

describe("api/units/colorDictionary", () => {
	it("exports a list of colors", () => {
		expect(list.length > 0).toBe(true);
		list.forEach((entry) => {
			expect(entry.name).toStrictEqual(expect.any(String));
			expect([String, Function]).toContain(entry.value.constructor);
		});
	});

	describe("extractPercentage", () => {
		const prefix = "mache das Licht vom Bett";
		it("extract 0", () => {
			expect(extractPercentage(prefix + "0 Prozent heller")).toMatchSnapshot();
		});
		it("extract a positive Number", () => {
			expect(extractPercentage(prefix + "20 Prozent heller")).toMatchSnapshot();
		});
		it("can parse relative values", () => {
			expect(extractPercentage(prefix + "ein wenig heller")).toMatchSnapshot();
			expect(extractPercentage(prefix + "etwas heller")).toMatchSnapshot();
			expect(extractPercentage(prefix + "viel heller")).toMatchSnapshot();
		});
	});

	describe("AdjustColorBrightness", () => {
		it.each([
			["check overflows", "#000000", -20],
			["check overflows", "#ffffff", +20],
			["lighten black ", "#000000", +20],
			["darken white", "#ffffff", -20],
			["lighten single color", "#ff0000", +20],
			["darken single color", "#ff0000", -20],
		])("%s - args: %s, %i%%", (description, color, percentage) => {
			expect(AdjustColorBrightness(color, percentage)).toMatchSnapshot();
		});
	});

	describe("AdjustColorTemperature", () => {
		it.each([
			["check overflows", "#0000ff", -20],
			["check overflows", "#ff0000", +20],
			["heatup black ", "#000000", +20],
			["cool down white", "#ffffff", -20],
			["cool down warm white", "#ff0000", -20],
			["heat up cold white", "#000000ff", -20],
		])("%s - args: %s, %i%%", (description, color, percentage) => {
			expect(AdjustColorTemperature(color, percentage)).toMatchSnapshot();
		});
	});
});
