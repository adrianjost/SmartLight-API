const Color = require("color");

/**
 * RGB Color
 * @typedef {Object} RGBColor
 * @property {number} r - 0-255
 * @property {number} g - 0-255
 * @property {number} b - 0-255
 */

 /**
 * @param  {string} hexColor 7 digit color string (including `#`)
 * @return {RGBColor} rgbColor to convert into hex string
 */
const hex2rgb = (hexColor) => {
  return Color(hexColor).object();
};

/**
 * @param  {RGBColor} rgbColor to convert into hex string
 * @return {string} hexColor 7 digit color string (including `#`)
 */
const rgb2hex = (rgbColor) => {
  return Color(rgbColor).hex().toLowerCase();
};

/**
 * @param  {string} hexColor 7 digit color string (including `#`)
 * @return {number} luminance of the color - Number between 0 and 100
 */
const getLuminance = (hexColor) => Color(hexColor).hsv().color[2];

/**
 * @param  {string} hexColor 7 digit color string (including `#`)
 * @param  {number} brightness brightness level between 0 and 100 (inclusive)
 * @return new hex color string
 */
const setLuminance = (hexColor, brightness) => {
	const hsl = Color(hexColor).hsv();
	hsl.color[2] = brightness;
	return hsl.hex();
};

module.exports = {
  hex2rgb,
  rgb2hex,
	getLuminance,
	setLuminance,
};
