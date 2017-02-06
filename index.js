/**
* Command line utility for calculating heptathlon cummulative scores given known format input.
*
* Exposes some functionality as a module for testing.
*
* File structure:
*   - Configuration including determining whether the module was called from the command line.
*   - Definition of functionality.
*   - Calling of command line functionality if called from command line.
*   - Exposure of an interface for testing.
*/


/*
 * Configuration
 */

// Determine if called from command line or required
// as a module, allowing command line functionality
// to be optional.
const calledFromCommandLine = (require.main === module);

// Configuration data.
const config = {
  defaultFilePath: 'heptathlon.csv',
  newlineRegex: /\n|\r\n|\r/,
  csvSeparator: ',',
  fieldIndex: {
    athlete: 0,
    competition: 1,
    result: 2,
    datetime: 3
  }
};


/*
 * Functionality.
 */

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

/**
 * Map a csv string to a formatted text summary of the data.
 *
 * Given a String representation of a csv file containing
 * heptathlon results in a known format, return a
 * formatted summary of event scores.
 * @param  {String} csvString
 * @param  {Regex} newlineRegex
 * @param  {String} csvSeparator
 * @return {String}              The processed score summary.
 */
function getSummary (csvString, newlineRegex, csvSeparator) {
  var summary;

  summary = csvString;

  return summary;
}


/*
 * Command line operations.
 */

// Conditionally execute command line functionality.
if (calledFromCommandLine) {
  // The conditional require is because of the one
  // file restriction, I would normally use a
  // separate module for each piece of functionality.
  const fs = require('fs');

  // Set input file path from passed parameters
  // or use default.
  const filePath = process.argv[2] || config.defaultFilePath;

  // Attempt to read the input file and if sucessful
  // generate and output the summary.
  fs.readFile(filePath, 'utf8', (err, csvString) => {
    if (err) {
      onFileReadError(err, filePath);
    } else {
      const summary = getSummary(csvString, config.newlineRegex, config.csvSeparator);
      process.stdout.write(summary);
    }
  });
}


/*
 * Expose interface for testing.
 */

module.exports = {
  getSummary: getSummary
};
