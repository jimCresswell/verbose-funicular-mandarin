/**
 * CSV parsing functionality.
 */

module.exports = {
  parse: parse,
  summarise: summarise
};

var calcPoints = require('./calcPoints');
var toSummaryString = require('./toSummaryString');

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
    .map((rowString) => rowString.split(csvSeparator).map(parseValues));

  // Decorate the data with the points for each event.
  data = addPoints(data);

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

/**
 * Map the parsed input csv data to a daily summary of cumulative points.
 *
 * @param  {Array} data Input parsed csv data.
 * @return {Array}      Daily summary of cumulative points.
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

  // Override the Array `toString` method with a summary specific method.
  summary.toString = toSummaryString;

  return summary;
}
