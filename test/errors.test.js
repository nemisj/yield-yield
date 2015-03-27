/*eslint es6:true */
describe('Errors', function () {
  var o_o = require('yield-twice');
  var expect = require('chai').expect;

  it('direct exception should propagate to the final callback', function (done) {

    o_o(function *() {
      var x = errorVariable;
    })(function (err) {
      expect(err.message).to.include('errorVariable is not defined');
      return done();
    });

  });

  it('should not propagate error in async part to the final callback', function (done) {

    o_o(function *() {
      setTimeout(function () {
        var x = s;
      }, 10);
    })(function (err) {
      expect(err).to.be.not.ok;
      return done();
    });

  });

  it('should detache from the main thread when calling cb', function (done) {

    var counter = 0;
    
    o_o(function *() {
      yield (yield)();
    })(function (err) {
      counter++;
      expect(counter).to.be.equal(1);
      done();
      throw new Error();
    });

  });


});
