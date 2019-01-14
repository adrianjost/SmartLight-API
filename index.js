/** EXPORT ALL FUNCTIONS
 *
 *   Loads all `.function.js` files
 *   Exports a cloud function matching the file name
 *
 *   Based on this thread:
 *     https://github.com/firebase/functions-samples/issues/170
 */
const glob = require("glob");
const camelCase = require("camelcase");

const files = glob.sync('./functions/**/*.function.js', { cwd: __dirname });

for(let f=0,fl=files.length; f<fl; f++){
  const file = files[f];
  const functionName = camelCase(file.slice(0, -12).split('/').filter((part) => {return part !== "functions";})); // Strip off '.function.js', than make the Path CamelCase
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName) {
    exports[functionName] = require(file);
  }
}