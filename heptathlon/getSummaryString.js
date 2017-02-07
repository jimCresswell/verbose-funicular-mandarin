/**
 * Given a summary object, return a formatted string representing that object.
 */

module.exports = getSummaryString;

const outputWidth = 20;

const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


/**
 * Create a formatted string representation of the summary object.
 * @param  {Array} summary The daily cumulative points.
 * @return {String}         A string representation of the summary.
 */
function getSummaryString (summary) {
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
      var scorePadding = ' '.repeat(outputWidth - (name.length + points.length));
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
