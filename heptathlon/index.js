/**
 * Entry point for functionality.
 */
module.exports = {
  getSummary: getSummary
};

var parse = require('./csv').parse;
var summarise = require('./summarise');

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
  var summary = summarise(parse(csvString, newlineRegex, csvSeparator));
  return summary.toString();
}
