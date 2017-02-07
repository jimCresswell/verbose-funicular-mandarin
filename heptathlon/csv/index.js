/**
 * CSV parsing functionality.
 */

module.exports = {
  parse: parse
};

var calcPoints = require('./calcPoints');


/**
 * Map from field descriptions to indices in data.
 * @type {Object}
 */
const fields = {athlete: 0, event: 1, result: 2, date: 3, points: 4};


/**
 * Given a CSV data string, return an object representation of the data.
 *
 * Split input on newline.
 * Remove empty rows.
 * Extract and sanitise individual values
 * @param  {String} csvString
 * @param  {Regex} newlineRegex
 * @param  {String} csvSeparator
 * @return {Array}              Object representation of the parsed CSV file.
 */
function parse (csvString, newlineRegex, csvSeparator) {
  var data = csvString
    .split(newlineRegex)
    .filter((rowString) => rowString.length > 0)
    .map((outcomeString) => getOutcome(outcomeString, csvSeparator));

  // Decorate the data with the points for each event.
  data = addPoints(data);

  // Ensure data in date order.
  data.sort((a, b) => a[fields.date].getTime() - b[fields.date].getTime());

  // Convenience method.
  data.getFirstDate = function () {
    return this[0][fields.date];
  };

  return data;
}


function getOutcome (outcomeString, csvSeparator) {
  var outcome = outcomeString.split(csvSeparator).map(parseValues);

  // Convenience method.
  outcome.getDetails = function () {
    return [this[fields.athlete], this[fields.date], this[fields.points]];
  };

  return outcome;
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
 * Return a copy of the data decorated with the points.
 *
 * @param  {Array} data
 * @return {Array} A modified copy of the data object.
 */
function addPoints (data) {
  return data.map((row) => {
    var eventAbbreviation = row[fields.event];
    var result = row[fields.result];
    var points = calcPoints(eventAbbreviation, result);

    row.push(points);

    return row;
  });
}
