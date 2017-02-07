var fs = require('fs');

var heptathlon = require('./heptathlon');
var config = require('./heptathlon/config');

// Set input file path from passed parameters
// or use default.
var filePath = process.argv[2] || config.defaultFilePath;

// Attempt to read the input file and if sucessful
// generate and output the summary.
fs.readFile(filePath, 'utf8', (err, csvString) => {
  if (err) {
    onFileReadError(err, filePath);
  } else {
    var summary = heptathlon.getSummary(csvString, config.newlineRegex, config.csvSeparator);
    process.stdout.write(summary);
  }
});


/**
 * Handle failure to read input data file.
 *
 * Exits process.
 * @param  {Error} err
 * @param  {String} filePath
 */
function onFileReadError (err, filePath) {
  console.error('File "' + filePath + '" could not be read, please review the error message:');
  console.error(err.toString());
  console.error('Exiting...');
  process.exit(1);
}
