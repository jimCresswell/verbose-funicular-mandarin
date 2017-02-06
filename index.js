/**
* Command line utility for calculating heptathlon cummulative scores given known format input.
*
* Exposes some functionality as a module for testing. In real life I'd break this up into
* multiple modules to ease unit testing and separate types of functionality.
*
* File structure:
*   - Configuration including determining whether the module was called from the command line.
*   - Definition of functionality.
*   - Conditoinal execution of command line functionality.
*   - Exposure of an interface for testing.
*/


/* === Configuration === */

// Determine if called from command line or required
// as a module, allowing command line functionality
// to be optional.
const calledFromCommandLine = (require.main === module);

// Application Configuration data.
const config = {
  defaultFilePath: 'heptathlon.csv',
  newlineRegex: /\n|\r\n|\r/,
  csvSeparator: ',',
  outputWidth: 20
};

const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// CSV field label to index.
const fields = {athlete: 0, event: 1, result: 2, date: 3, points: 4};

/**
 * Athletic event type and point weightings for each event.
 * @type {Object}
 */
const eventsConfig = {
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
 *
 * Opted to put this with config because it is closely related to `eventsConfig`.
 * @type {Object}
 */
const calcPointsByType = {
  running: (result, A, B, C) => Math.floor(A * Math.pow((B - result), C)),
  throwing: (result, A, B, C) => Math.floor(A * Math.pow((result - B), C)),
  jumping: (result, A, B, C) => Math.floor(A * Math.pow(((result * 100) - B), C))
};


/* === Functionality. === */

/**
 * Add a leading zero to the day of the month if it is a single digit.
 * @param  {Number} dayOfMonth
 * @return {String}            Padded day of month.
 */
function leftPadDate (dayOfMonth) {
  dayOfMonth = String(dayOfMonth);
  if (dayOfMonth.length < 2) {
    return '0' + dayOfMonth;
  }
  return dayOfMonth;
}

/**
 * [formatSummary description]
 * @param  {Object} summary The daily cumulative points.
 * @return {String}         A string representation of the summary.
 */
function formatSummary (summary) {
  var output = [];
  // Get an array of names.
  var names = Object.keys(summary.names);

  summary.forEach(function (day, dayCounter) {
    // Construct the day label while we have access to the date.
    var date = day.date;
    var dayLabel = 'Day ' + (dayCounter + 1) + ': ' +
      leftPadDate(date.getUTCDate()) + ' ' +
      monthAbbreviations[date.getUTCMonth()] + ' ' +
      date.getFullYear();

    output.push('--------------------');
    output.push(' ' + dayLabel);
    output.push('--------------------');

    // Store names with scores and sort by score.
    var scores;
    scores = names.map(name => [name, day[name]]);
    scores.sort((a, b) => b[1] - a[1]);

    // Add scores to output.
    scores.forEach(function (score) {
      var name = score[0].toUpperCase();
      var points = score[1].toString();
      var scorePadding = ' '.repeat(config.outputWidth - (name.length + points.length));
      output.push(name + scorePadding + points);
    });

    // Newline between day summaries.
    if (dayCounter < summary.length - 1) {
      output.push('');
    }
  });

  return output.join('\n');
}

/**
 * Map the parsed input csv data to a daily summary of cumulative points.
 *
 * @param  {Object} data Input parsed csv data.
 * @return {Object}      Daily summary of cumulative points.
 */
function summarise (data) {
  var summary = [];
  var dayCounter = 0;
  var names = [];

  // Ensure data in date order.
  data.sort((a, b) => a[fields.date].getTime() - b[fields.date].getTime());

  var currentDate = data[fields.athlete][fields.date];

  // Convert from input data to a day by day summary of points.
  data.forEach(function (row) {
    var athlete = row[fields.athlete];
    var eventDate = row[fields.date];
    var points = row[fields.points];

    // Store the names given to date for use
    // in calculating cumulative scores.
    names[athlete] = true;

    // Check if next day of events have started.
    if (currentDate.getTime() !== eventDate.getTime()) {
      currentDate = eventDate;
      dayCounter++;
    }

    // Make sure an objects for that days events exists.
    summary[dayCounter] = summary[dayCounter] || {};

    // Store the date.
    summary[dayCounter].date = currentDate;

    // If no score exists for the day create it.
    summary[dayCounter][athlete] = summary[dayCounter][athlete] || 0;

    // Add the score for this event to the total for this day.
    summary[dayCounter][athlete] += points;
  });

  // Store the names on the summary array object.
  summary.names = names;

  // Make the scores for each day cumulative.
  Object.keys(names).forEach(function (name) {
    summary.forEach(function (day, index, summary) {
      var previousDay;

      // Make sure a score exists for each name.
      day[name] = day[name] || 0;
      if (index > 0) {
        previousDay = summary[index - 1];
        day[name] += previousDay[name];
      }
    });
  });

  return summary;
}

/**
 * Given an event type and a result, calculate the points.
 * @param  {String} eventAbbreviation
 * @param  {Number} result            Event result.
 * @return {Number}                   Points scored.
 */
function calcPoints (eventAbbreviation, result) {
  const eventConfig = eventsConfig[eventAbbreviation];
  const eventType = eventConfig.type;
  const weights = eventConfig.weights;

  return calcPointsByType[eventType](result, weights.A, weights.B, weights.C);
}

/**
 * Modify the data to include the points scored in each event.
 *
 * @param  {Object} data
 * @return {Object} The modified data object.
 */
function addPoints (data) {
  data.forEach((row) => {
    const eventAbbreviation = row[fields.event];
    const result = row[fields.result];

    const points = calcPoints(eventAbbreviation, result);

    row.push(points);
  });

  return data;
}

/**
 * Given input values taken from a data table of known format parse those values.
 *
 * @param  {String} value The value taken from the input data table.
 * @param  {Number} index The column in the input data table.
 * @return {String|Number|Date}       The parsed value.
 */
function parseValues (value, index) {
  // Remove leading and trailing white space and capitalisation.
  value = value.trim().toLowerCase();

  // Process values, either a single number or minute:second format.
  if (index === 2) {
    value = value.split(':');
    if (value.length === 2) {
      // Convert minutes and seconds to seconds.
      value = parseFloat(value[1]) + parseFloat(value[0]) * 60;
    } else {
      value = parseFloat(value[0]);
    }
  }

  // Get date.
  if (index === 3) {
    // Time of day not required so discard, ensuring
    // that Date treats string as UTC.
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
  // Split input on platform independent newline.
  // Remove empty rows.
  // Extract and sanitise individual values
  var data = csvString
    .split(newlineRegex)
    .filter((rowString) => rowString.length > 0)
    .map((rowString) => rowString.split(csvSeparator).map(parseValues));

  return formatSummary(summarise(addPoints(data)));
}


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


/* === Command line operations. Executed conditionally. === */

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


/* === Expose interface for testing. === */

module.exports = {
  getSummary: getSummary,
  appConfig: config,
  eventsConfig: eventsConfig,
  calcPoints: calcPoints
};
