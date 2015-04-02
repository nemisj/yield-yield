/*eslint es6:true */
describe('Errors', function () {
  var o_o = require('yield-yield');
  var expect = require('chai').expect;

  it('breaks before first yield', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });

  });

  it('breaks after first yield before second yield', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      var cb = yield;
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });
  });

  it('breaks after second yield in async', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      var cb = yield;
      setTimeout(cb, 50);
      var result = yield;
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });
  });

  it('breaks after second yield in sync', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      var cb = yield;
      cb();
      var result = yield;
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });
  });

  it('breaks after third yield', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      var cb = yield;
      cb();
      var result = yield;
      var cb1 = yield;
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });
  });

  it('breaks after fourth yield', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      var cb = yield;
      cb();
      var result = yield;
      var cb1 = yield;
      cb1();
      result = yield;
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });
  });

  it('breaks after fourth yield in async', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);
    var fnc = o_o(function *() {
      var cb = yield;
      cb();
      var result = yield;
      var cb1 = yield;
      setTimeout(cb1, 50);
      result = yield;
      throw new Error(msg);
    });

    fnc(function (err) {
      expect(err.message).to.be.equal(msg);
      return done();
    });
  });

  it('should show error if cb is called twice after second yield sync', function (done) {
    var counter = 0;
    var finished = false;

    o_o(function *() {

      var cb = yield;
      cb();
      var ret = yield;

      expect(function () {
        cb();
      }).to.throw('Callback is called twice');
      finished = true;

    })(function (err) {

      counter++;
      expect(counter).to.equal(1);
      expect(finished).to.be.true;

      return done();
    });
  });

  it('should show error if cb is called twice after second yield async', function (done) {
    var counter = 0;
    o_o(function *() {

      var cb = yield;
      cb();
      var ret = yield;

      setTimeout(function () {
        expect(function () {
          cb();
        }).to.throw('Callback is called twice');
        throw new Error('Should not trigger second time call into the callback');
      }, 50);

    })(function (err) {
      counter++;
      expect(counter).to.equal(1);
      expect(err).to.be.not.ok;

      return done();
    });
  });


  it('should show error if cb is called twice before yield in sync', function (done) {
    var finished = false;

    o_o(function *() {

      var cb = yield;
      cb();
      expect(function () {
        cb();
      }).to.throw('Callback is called twice');

      yield;

      finished = true;

    })(function (err) {

      expect(finished).to.be.true;
      return done();
    });
  });

  it('should show error when generator returns before in sync', function (done) {

      var fnc = o_o(function *() {
        var cb = yield;
        cb(null, 'result one');
        return;
      });
      
      fnc(function (err) {
        expect(err.message).to.include('Generator has no second yield statement');
        return done();
      });

  });

  it('should show error when generator returns before in async', function (done) {

      var fnc = o_o(function *() {
        var cb = yield;

        setTimeout(function () {
          cb(null, 'result one');
        }, 50);
        
        return;
      });
      
      fnc(function (err) {
        expect(err.message).to.include('Generator has no second yield statement');
        return done();
      });

  });

  it('should give error that function is not a generator', function () {
    expect(function () {
      o_o(function () {});
    }).to.throw('Function is not a Generator');

  });

//  it('should detach from the main thread when calling cb', function (done) {
//
//    var counter = 0;
//    
//    o_o(function *() {
//      yield (yield)();
//    })(function (err) {
//      counter++;
//      expect(counter).to.be.equal(1);
//      done();
//      throw new Error();
//    });
//
//  });


});
