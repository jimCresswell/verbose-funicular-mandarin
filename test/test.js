require('chai').should();

var heptathlon = require('../index.js');

const inputData = require('./data/inputData');
const outputData = require('./data/outputData');

// Integration test.
describe('The whole system', function () {
  it('Should map the test input to test output.', function () {
    heptathlon.getSummary(inputData).should.equal(outputData);
  });
});

// Points calculation
describe('Point scoring', function () {
  it('Should match the provided 100m example', function () {
    const event = '100m';
    const result = 16.2; // Seconds

    const eventConfig = heptathlon.eventConfig[event];
    const eventType = eventConfig.type;
    const weights = eventConfig.weights;
    const calcScore = heptathlon.calcScores[eventType];

    const points = calcScore(result, weights.A, weights.B, weights.C);

    points.should.equal(690);
  });

  // https://en.wikipedia.org/wiki/Heptathlon#Women.27s_world_records_compared_to_heptathlon_bests
  it('Should match the long jump example on Wikipedia', function () {
    const event = 'long';
    const result = 7.27; // Metres

    const eventConfig = heptathlon.eventConfig[event];
    const eventType = eventConfig.type;
    const weights = eventConfig.weights;
    const calcScore = heptathlon.calcScores[eventType];

    const points = calcScore(result, weights.A, weights.B, weights.C);

    points.should.equal(1264);
  });

  it('Should match the javelin example on Wikipedia', function () {
    const event = 'javelin';
    const result = 60.90; // Metres

    const eventConfig = heptathlon.eventConfig[event];
    const eventType = eventConfig.type;
    const weights = eventConfig.weights;
    const calcScore = heptathlon.calcScores[eventType];

    const points = calcScore(result, weights.A, weights.B, weights.C);

    points.should.equal(1072);
  });
});
