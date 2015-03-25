describe('index.js', function () {

  var y2 = require('../index.js');
  var expect = require('chai').expect;

  it('should be a function', function () {
    expect(y2).to.be.a('function');
  });

  it('should wrap function', function () {

    var fnc = y2(function *() {});
    expect(fnc).to.be.a('function');

  });

  it('should execute callback', function (done) {

    var fnc = y2(function *() {
      var cb = yield;

      setTimeout(function () {
        cb();
      }, 200);

      return yield;
    });

    fnc(function () {
      return done();
    });
    
  });

  it('should pass argumets to the callback');

});
