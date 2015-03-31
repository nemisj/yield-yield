describe('test.twice.js', function () {

  var o_o = require('yield-yield');
  var fs = require('fs');
  var expect = require('chai').expect;

  it('should wait till the callback in the normal conditions', function (done) {

    o_o(function *() {
      var result = yield fs.readFile(__filename, { encoding: 'utf8' }, yield);

      expect(result[0]).to.be.null;
      expect(result[1]).to.include('describe');

      return done();

    }).run();

  });

  it('should pass real values', function (done) {
    var fnc = o_o(function *() {
      return yield fs.readFile(__filename, { encoding: 'utf8' }, yield);
    });

    fnc(function (err, contents) {
      expect(contents).to.include('describe');
      done();
      return;
    });

  });

  it('should run correctly when callback is called before the yield', function (done) {

    o_o(function *() {

      var cb = yield;
      cb('First argument');
      var result = yield;

      expect(result[0]).to.equal('First argument');

      return done();
    }).run();

  });

  it('should run multiple times in sync-flow', function (done) {

    o_o(function *() {
      var cb = yield;
      cb('Result one');
      var resultOne = yield;

      var cb = yield;
      cb('Result two');
      var resultTwo = yield;

      expect(resultOne[0]).to.equal('Result one');
      expect(resultTwo[0]).to.equal('Result two');

      return done();
    }).run();


  });

  it('should run multiple times in async-flow', function (done) {
    o_o(function *() {

      var cb = yield;
      var resultOne = yield setTimeout(function () {
        return cb(null, 'result one');
      }, 50);

      var cb = yield;
      var resultTwo = yield setTimeout(function () {
        return cb(null, 'result two');
      }, 50);
      
      expect(resultOne[1]).to.equal('result one');
      expect(resultTwo[1]).to.equal('result two');

      return done();
    }).run();

  });

  it('should do something when generator returns before in sync-flow', function (done) {

      var fnc = o_o(function *() {
        var cb = yield;

        cb(null, 'result one');

        return;
      });

      fnc(function (e) {
        expect(e.message).to.include('Generator has no second yield statement');
        return done();
      });

  });

});
