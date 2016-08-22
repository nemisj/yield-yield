describe('queue.test.js', function () {
  var expect = chai.expect;
  var QCOLLECT= o_o.QCOLLECT;
  var QRUN = o_o.QRUN;

  it('should collect arguments with QCOLLECT', o_o(function *() {

    var one = function (cb) {
      setTimeout(function () {
        cb('one');
      }, 500);
    };

    var two = function (cb) {
      setTimeout(function () {
        cb('two');
      }, 200);
    };

    var three = function (cb) {
      setTimeout(function () {
        cb('three');
      }, 10);
    }

    one(yield QRUN);
    two(yield QRUN);
    three(yield QRUN);

    const results = yield QCOLLECT;

    expect(results).to.deep.equal([['one'], ['two'], ['three']]);
  }));

  it('should be asynced till QCOLLECT', o_o(function *() {

    var results = {
      one: false,
      two: false,
      three: false
    };

    var one = function (cb) {
      setTimeout(function () {
        results.one = true;
        return cb();
      }, 500);
    };

    var two = function (cb) {
      setTimeout(function () {
        results.two = true;
        return cb();
      }, 200);
    };

    var three = function (cb) {
      setTimeout(function () {
        results.three = true;
        return cb();
      }, 10);
    }

    one(yield QRUN);
    expect(results.one).to.be.equal(false);

    two(yield QRUN);
    expect(results.two).to.be.equal(false);

    three(yield QRUN);
    expect(results.three).to.be.equal(false);

    yield QCOLLECT;

    expect(results).to.be.deep.equal({
      one: true,
      two: true,
      three: true
    });

  }));

  it('should work with the twicer in between', o_o(function *() {
    var one = function (cb) {
      setTimeout(function () {
        cb('one');
      }, 500);
    };


    var to = function (cb) {
      setTimeout(function () {
        return cb(null, 'to');
      }, 200);
    };

    one(yield QRUN);

    var result = yield to(yield);
    expect(result).to.be.equal('to');

    result = yield QCOLLECT;

    expect(result[0]).to.be.deep.equal(['one']);

  }));
});
