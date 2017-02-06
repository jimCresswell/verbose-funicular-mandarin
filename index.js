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

// Application Configuration data.
const config = {
  defaultFilePath: 'heptathlon.csv',
  newlineRegex: /\n|\r\n|\r/,
  csvSeparator: ','
};

/**
 * Event type and point weightings for each event.
 * @type {Object}
 */
const eventConfig = {
  '200m': { type: 'running', weights: { A: 4.99087, B: 42.5, C: 1.81 } },
  '800m': { type: 'running', weights: { A: 0.11193, B: 254, C: 1.88 } },
  '100m': { type: 'running', weights: { A: 9.23076, B: 26.7, C: 1.835 } },
  'high': { type: 'jumping', weights: { A: 1.84523, B: 75.0, C: 1.348 } },
  'long': { type: 'jumping', weights: { A: 0.188807, B: 210, C: 1.41 } },
  'shot': { type: 'throwing', weights: { A: 56.0211, B: 1.50, C: 1.05 } },
  'javelin': { type: 'throwing', weights: { A: 15.9803, B: 3.80, C: 1.04 } }
};

/**
 * For a given event type and result calculate the score.
 * @type {Object}
 */
const calcScores = {
  running: (result, A, B, C) => Math.floor(A * Math.pow((B - result), C)),
  throwing: (result, A, B, C) => Math.floor(A * Math.pow((result - B), C)),
  jumping: (result, A, B, C) => Math.floor(A * Math.pow(((result * 100) - B), C))
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
 * Given input values taken from a data table of known format parse those values.
 *
 * @param  {String} value The value taken from the input data table.
 * @param  {Number} index The column in the input data table.
 * @return {String|Number|Date}       The parsed value.
 */
function parseValues (value, index) {
  var eventType;

  // Remove leading and trailing white space and capitalisation.
  value = value.trim().toLowerCase();

  // Get the event type.
  if (index === 1) {
    eventType = eventConfig[value].type;
  }

  // Format result according to event type.
  if (index === 2) {
    if (eventType === 'throwing' || eventType === 'jumping') {
      // Distance in metres.
      value = parseFloat(value);
    } else {
      // Running. Time in second or minute:second format.
      value = value.split(':');
      if (value.length === 2) {
        value = parseFloat(value[1]) + parseFloat(value[0]) * 60;
      } else {
        value = parseFloat(value[0]);
      }
    }
  }

  // Get date.
  if (index === 3) {
    // Time of day not required so discard,
    // ensuring that Date treats string
    // as UTC.
    value = new Date(value.split(' ')[0]);
  }

  return value;
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
  var data, summary;

  // Split input on platform independent newline.
  // Remove empty rows.
  // Extract and sanitise individual values
  data = csvString
    .split(newlineRegex)
    .filter((rowString) => rowString.length > 0)
    .map((rowString) => rowString.split(csvSeparator).map(parseValues));

  // Null operation.
  summary = data.join('\n');

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
  getSummary: getSummary,
  eventConfig: eventConfig,
  calcScores: calcScores
};
