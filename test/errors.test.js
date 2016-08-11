/*eslint es6:true */
/*global o_o, expect*/

describe('errors.test.js', function () {

  var expect = chai.expect;

  // XXX: don't know how to handle it,
  it.skip('should throw when no callback is specified', function (done) {
    o_o.run(function *() { throw new Error('zork'); })
  });

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
      }, 50);

    })(function (err) {
      expect(err).to.be.not.ok;
      counter++;
      expect(counter).to.equal(1);

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
      o_o({});
    }).to.throw('Generator is not a function');

  });

  it('should throw and catch an error when callback recieves error as first argument', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);

    var method = function (cb) {
      setTimeout(function () {
        cb(new Error(msg));
      }, 50);
    };

    var result = null;

    var gen = o_o(function *() {
      var cb = yield;

      try {
        yield method(cb);
      } catch (e) {
        result = e;
      }

      return;
    });

    gen(function () {
      expect(result).to.have.property('message').and.be.equal(msg);
      return done();
    });
  });

  it('should throw an error when callback receives error as first argument', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);

    var method = function (cb) {
      setTimeout(function () {
        cb(new Error(msg));
      }, 50);
    };

    var gen = o_o(function *() {
      var cb = yield;

      yield method(cb);

      return;
    });

    gen(function (result) {
      expect(result).to.have.property('message').and.be.equal(msg);
      return done();
    });
  });

  it('should NOT block generator after error is thrown', function (done) {
    var msg = 'error #' + ~~(Math.random() * 1000);

    var method = function (cb) {
      setTimeout(function () {
        cb(new Error(msg));
      }, 50);
    };

    var flag = 'bad';

    var gen = o_o(function *() {
      var cb = yield;

      try {
        yield method(cb);
      } catch(e) {
        flag = 'processed';
      }

      cb = yield;
      yield setTimeout(function () {
        cb();
      }, 50);

      flag = 'good';

      return;
    });

    gen(function () {
      expect(flag).to.be.equal('good');
      return done();
    });
  });

  it('should break with raw generator', function (done) {
    var id = new Date().getTime().toString(16);

    var rawGenerator = function *(a) {

      var cb = yield;

      yield setTimeout(function () {
        return cb();
      }, 20);

      throw new Error(id);
    };

    o_o.run(function *() {
      var result;

      try {
        yield rawGenerator(id);
      } catch(e) {
        result = e;
      }

      expect(result.message).to.be.equal(id);

      done();
    });

  });

  it('should break when too much arguments are specified', function () {
    var fnc = o_o(function *(one, two) {
      console.log('hoho', one);
    });

    expect(function () {
      fnc('bla', 'two', 'three');
    }).to.throw('Arguments mismatch, too much arguments passed.');

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
