/**
 * Summary generating functionality.
 */
module.exports = summarise;

var toSummaryString = require('./toSummaryString');

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
  var currentDate;

  // Override the Array `toString` method with a summary specific method.
  summary.toString = toSummaryString;

  // Convert from input data to a day by day summary of points.
  currentDate = data.getFirstDate();
  data.forEach(function (outcome) {
    var athlete, eventDate, points;

    [athlete, eventDate, points] = outcome.getDetails();

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
