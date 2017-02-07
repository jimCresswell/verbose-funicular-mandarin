require('chai').should();

var heptathlon = require('../heptathlon');
var config = require('../heptathlon/config');

const inputData = require('./data/inputData');
const outputData = require('./data/outputData');

describe('The whole system', function () {
  it('Should map the test input to test output.', function () {
    heptathlon.getSummary(inputData, config.newlineRegex, config.csvSeparator).should.equal(outputData);
  });
});
