/**
 * Points calculating functionality.
 */

module.exports = function calcPoints (eventAbbreviation, result) {
  var eventConfig = eventsConfig[eventAbbreviation];
  var eventType = eventConfig.type;
  var weights = eventConfig.weights;

  return calcPointsByType[eventType](result, weights.A, weights.B, weights.C);
};

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
 * @type {Object}
 */
const calcPointsByType = {
  running: (result, A, B, C) => Math.floor(A * Math.pow((B - result), C)),
  throwing: (result, A, B, C) => Math.floor(A * Math.pow((result - B), C)),
  jumping: (result, A, B, C) => Math.floor(A * Math.pow(((result * 100) - B), C))
};

/**
 * Given an event type and a result, calculate the points.
 * @param  {String} eventAbbreviation
 * @param  {Number} result            Event result.
 * @return {Number}                   Points scored.
 */
