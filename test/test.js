require('chai').should();

var calcScores = require('../index.js');

const inputData = require('./data/inputData');
const outputData = require('./data/outputData');

// End to end test.
describe('The whole system', function () {
  it('Should map the test input to test output.', function () {
    calcScores.summary(inputData).should.equal(outputData);
  });
});
