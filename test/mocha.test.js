/*eslint-env mocha*/
describe('mocha.test.js', function () {
  var expect = chai.expect;
  var flag = false;

  // that's the only way I can test that async test is executed
  afterEach(function () {
    if (!flag) {
      throw new Error('there is something wrong with mocha and yield-yield, sheff');
    }
  });

  it('should execute mocha async', o_o(function *() {

    var start = new Date().getTime();
    yield setTimeout(yield, 100);
    var end = new Date().getTime();

    expect(end - start >= 100).to.be.true;

    flag = true;

  }));



});
