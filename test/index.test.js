describe('index.js', function () {

  var y2 = require('../index.js');
  var expect = require('chai').expect;
  var fs = require('fs');
  var async = require('async');

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
      }, 50);

      return yield;
    });

    return fnc(done);
    
  });

  // whenever yield returns arguments,
  // they can be passed directly to the generator
  // and will be unwrapped
  it('should pass arguments to the callback unwrapped', function (done) {
    var fnc = y2(function *() {
      var cb = yield;

      setTimeout(function () {
        cb('arg1', 'arg2', 'arg3');
      }, 50);

      var result = yield;

      return result;
    });

    fnc(function (arg1, arg2, arg3) {
      expect(arg1).to.equal('arg1');
      expect(arg2).to.equal('arg2');
      expect(arg3).to.equal('arg3');

      return done();
    });

  });

  it('should pass arguments to the callback wrapped', function (done) {
    var fnc = y2(function *() {
      var cb = yield;

      setTimeout(function () {
        cb('arg1', 'arg2', 'arg3');
      }, 50);

      var result = yield;

      return [result[0], result[1]];
    });

    fnc(function (e, r) {
      expect(r[0]).to.equal('arg1');
      expect(r[1]).to.equal('arg2');

      return done();
    });

  });

  it('should pass error back as first argument', function (done) {
    var fnc = y2(function *() {
      var cb = yield;

      throw new Error('Testing error');

      return yield;
    });

    fnc(function (e) {
      expect(e.message).to.include('Testing error');

      return done();
    });
  });

  //
  // Passing arguments via callback, like old node.js style
  //
  it('should pass arguments to the generator', function (done) {
    var fnc = y2(function *() {
      return yield fs.readFile(__filename, { encoding: 'utf8' }, yield);
    });

    fnc('arg1', 'arg2', function (err, contents) {
      expect(err).to.be.not.ok;
      expect(contents).to.include('describe(\'index.js\',');
      return done();
    });
  });

  it('should work with async', function (done) {
    var fnc = y2(function *() {

      var result = yield async.map(['a', 'b', 'c'], function (item, cb) {
        setTimeout(function () {
          cb(null, item + ':change');
        }, 10);
      }, yield);

      return result;
    });

    fnc(function (err, result) {
      expect(result).to.deep.equal([
        'a:change', 'b:change', 'c:change'
      ]);
      done();
    });

  });

});
