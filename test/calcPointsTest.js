require('chai').should();

var calcPoints = require('../heptathlon/csv/calcPoints');

// Points calculation
describe('Point scoring', function () {
  it('Should match the provided 100m example', function () {
    const event = '100m';
    const result = 16.2; // Seconds

    calcPoints(event, result).should.equal(690);
  });

  // https://en.wikipedia.org/wiki/Heptathlon#Women.27s_world_records_compared_to_heptathlon_bests
  it('Should match the long jump example on Wikipedia', function () {
    const event = 'long';
    const result = 7.27; // Metres

    calcPoints(event, result).should.equal(1264);
  });

  it('Should match the javelin example on Wikipedia', function () {
    const event = 'javelin';
    const result = 60.90; // Metres

    calcPoints(event, result).should.equal(1072);
  });
});
