describe('index.test.js', function () {

  // var async = require('async');
  var expect = chai.expect;

  var __filename = 'file #' + ~~(Math.random() * 1000);

  it('should be a function', function () {
    expect(o_o).to.be.a('function');
  });

  it('should wrap function', function () {

    var fnc = o_o(function *() {});
    expect(fnc).to.be.a('function');

  });

  it('should run two raw generators as is', function (done) {
    var one = function *(a) {
      yield setTimeout(yield, 20);
      return 'one';
    };

    var two = function *(a) {
      var resultOne = yield one();
      yield setTimeout(yield, 20);
      return [resultOne, 'two'];
    };

    o_o.run(function *() {
      var resultTwo = yield two();
      expect(resultTwo).to.deep.equal(['one', 'two']);
      return done();
    });

  });

  it('should run raw generator as is', function (done) {
    var id = new Date().getTime().toString(16);

    var rawGenerator = function *(a) {

      var cb = yield;

      yield setTimeout(function () {
        return cb();
      }, 20);

      return a + '!';
    };

    o_o.run(function *() {
      var result = yield rawGenerator(id);

      expect(result).to.be.equal(id + '!');
      
      done();

    });

  });

  /*
  it('should never execute callback', function (done) {
    var called = false;

    var fnc = o_o(function *() {
      var cb = yield;
      var result = yield;
      called = true;
    });

    fnc(function () {
      return done();
    });

  });
  */

  it('should pass arguments as they are', function (done) {
    var arg1 = '#' + ~~(Math.random() * 1000);

    var finished = false;

    var fnc = o_o(function *($1, cb) {

      expect($1).to.be.equal(arg1);
      expect(cb).to.be.a('function');
      expect(arguments.length).to.be.equal(2);

      finished = true;

      return cb();

    });

    fnc(arg1, function () {
      expect(finished).to.be.true;
      return done();
    });

  });

  it('should execute callback when it is not specified but givven', function (done) {

    var finished = false;
    var fnc = o_o(function *() {
      finished = true;
    });

    fnc(function () {
      expect(finished).to.be.true;
      return done();
    });
    
  });

  // whenever yield returns arguments,
  // they can be passed directly to the generator
  // and will be unwrapped
  it('should pass arguments to the callback unwrapped async', function (done) {
    var fnc = o_o(function *() {
      var cb = yield;

      var r = yield setTimeout(function () {
        cb(null, 'arg1', 'arg2', 'arg3');
      }, 50);

      return r;
    });

    fnc(function (e, r) {
      expect(r[0]).to.equal('arg1');
      expect(r[1]).to.equal('arg2');
      expect(r[2]).to.equal('arg3');

      return done();
    });

  });

  it('should pass arguments to the callback wrapped', function (done) {
    var fnc = o_o(function *() {
      var cb = yield;

      setTimeout(function () {
        cb(null, 'arg1', 'arg2', 'arg3');
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
    var fnc = o_o(function *() {
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
    var fnc = o_o(function *(arg1, arg2) {
      // return yield fs.readFile(arg1, { encoding: 'utf8' }, yield);
      return [ arg1 + '-test', arg2 + '-test' ];
    });

    fnc(__filename, 'arg2', function (err, args) {

      expect(err).to.be.not.ok;

      expect(args[0]).to.equal(__filename + '-test');
      expect(args[1]).to.equal('arg2-test');

      return done();
    });
  });

  it('should execute both methods', function (done) {
    var execute = o_o(function *(request){ 
      // this one sends request to the server
      yield setTimeout(yield, 30);
      return request + ':' + new Date().getTime();
    });

    var get = o_o(function *(name) {
      var upper = name.toUpperCase();
      return yield execute(upper, yield);
    });

    var start = new Date().getTime();
    get('maks', function (err, result) {
      var split = result.split(':');
      expect(split[0]).to.be.equal('MAKS');
      expect(split[1] - start >= 30).to.be.true;

      return done();
    });


  });

  it('should have run', function (done) {
    o_o.run(function *() {
      yield setTimeout(yield, 20);
      return done();
    })
  });

//  it('should work with async', function (done) {
//    var fnc = o_o(function *() {
//
//      var result = yield async.map(['a', 'b', 'c'], function (item, cb) {
//        setTimeout(function () {
//          cb(null, item + ':change');
//        }, 10);
//      }, yield);
//
//      return result;
//    });
//
//    fnc(function (err, result) {
//      expect(result).to.deep.equal([
//        'a:change', 'b:change', 'c:change'
//      ]);
//      done();
//    });
//
//  });

});
