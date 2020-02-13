const {
	getLuminance,
	setLuminance,
	hex2rgb,
	rgb2hex,
} = require("../utils/color");

/**
 * @param  {string} user input in natural language
 * @return {number} amount of change requested by the user in percentage (integer)
 */
function extractPercentage(string) {
	// try to extract the exact percentage requested by the user first
	const percentageExtractRegex = /([0-9]{1,3})(?:%| ?Prozent)/;
	const matches = percentageExtractRegex.exec(string);
	if (matches && matches.length >= 2) {
		return parseInt(matches[1], 10);
	}
	// if no percentage was found convert natural language hints into predefined values
	if (string.includes("etwas") || string.includes("ein wenig")) {
		return 10;
	}
	if (string.includes("viel")) {
		return 50;
	}
	return 30;
}

/**
 * @param  {string} color 7 digit color string (including `#`)
 * @param  {number} percentage positive values will increase the brightness
 * @return {string} new 7 digit color string (including `#`)
 */
function AdjustColorBrightness(color, percentage) {
	const luminance = getLuminance(color);
	const newLuminance = Math.min(Math.max(luminance + percentage, 0), 255);
	const newColor = setLuminance(color, newLuminance);
	return newColor;
}

/**
 * will increase/decrease the red and blue value of the given color
 * while trying to keep the brightness at an equal level.
 * @param  {string} color 7 digit color string (including `#`)
 * @param  {number} percentage positive values will increase the color temperature
 * @return {string} new 7 digit color string (including `#`)
 */
function AdjustColorTemperature(color, percentage) {
	// split percentage in half to split the manipulation between the red and blue color channel.
	halfDiff = percentage * 1.275;
	const rgbColor = hex2rgb(color);
	rgbColor.r = Math.max(Math.min(rgbColor.r + halfDiff, 255), 0);
	rgbColor.b = Math.max(Math.min(rgbColor.b - halfDiff, 255), 0);
	return rgb2hex(rgbColor);
}

function lighten(currentColor, requestString) {
	return AdjustColorBrightness(currentColor, extractPercentage(requestString));
}

function darken(currentColor, requestString) {
	return AdjustColorBrightness(currentColor, -extractPercentage(requestString));
}

function heatUp(currentColor, requestString) {
	return AdjustColorTemperature(currentColor, extractPercentage(requestString));
}

function coolDown(currentColor, requestString) {
	return AdjustColorTemperature(
		currentColor,
		-extractPercentage(requestString)
	);
}

module.exports = {
	extractPercentage,
	AdjustColorBrightness,
	AdjustColorTemperature,
	lighten,
	darken,
	heatUp,
	coolDown,
	list: [
		{ name: "rot", value: "#ff0000" },
		{ name: "orange", value: "#ff9900" },
		{ name: "grün", value: "#00ff00" },
		{ name: "blau", value: "#0000ff" },
		{ name: "schwarz", value: "#000000" },
		{ name: "aus", value: "#000000" },
		{ name: "weiß", value: "#ffffff" },
		{ name: "an", value: "#ffffff" },
		{ name: "türkis", value: "#00ffff" },
		{ name: "lila", value: "#b90cff" },
		{ name: "pink", value: "#ff00ff" },
		{ name: "gelb", value: "#ffff00" },
		{ name: "hell", value: lighten },
		{ name: "dunkel", value: darken },
		{ name: "dunkler", value: darken },
		{ name: "wärmer", value: heatUp },
		{ name: "kühler", value: coolDown },
		{ name: "kälter", value: coolDown },
	],
};
