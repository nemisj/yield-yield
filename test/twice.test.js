describe('Yield twice', function () {
  var y2 = require('yield-twice');
  var fs = require('fs');
  var expect = require('chai').expect;

  it('should wait till the callback in the normal conditions', function (done) {

    y2(function *() {
      var result = yield fs.readFile(__filename, { encoding: 'utf8' }, yield);

      expect(result[0]).to.be.null;
      expect(result[1]).to.include('describe(\'Yield twice\',');

      return done();

    });

  });

  it('should run correctly when callback is called before the yield', function (done) {
    y2(function *() {

      var cb = yield;
      cb('First argument');
      var result = yield;

      expect(result[0]).to.equal('First argument');

      return done();
    });
  });

  it('should run multiple times in sync-flow', function (done) {

    y2(function *() {
      var cb = yield;
      cb('Result one');
      var resultOne = yield;

      var cb = yield;
      cb('Result two');
      var resultTwo = yield;

      expect(resultOne[0]).to.equal('Result one');
      expect(resultTwo[0]).to.equal('Result two');

      return done();
    });


  });

  it('should run multiple times in async-flow', function (done) {
    y2(function *() {

      var cb = yield;
      var resultOne = yield setTimeout(function () {
        return cb(null, 'result one');
      }, 100);

      var cb = yield;
      var resultTwo = yield setTimeout(function () {
        return cb(null, 'result two');
      }, 100);
      
      expect(resultOne[1]).to.equal('result one');
      expect(resultTwo[1]).to.equal('result two');

      return done();
    });

  });

  it('should show error if cb is called multiple times in sync-flow', function (done) {
    y2(function *() {

      var cb = yield;
      cb();
      expect(function () {
        cb();
      }).to.throw('Callback is called twice');

      var ret = yield;

      return done();
    });
  });

  it('should show error if cb is called in between yield', function (done) {
    y2(function *() {

      var cb = yield;
      cb();
      var ret = yield;

      expect(function () {
        cb();
      }).to.throw('Callback is called twice');

      return done();
    });
  });

  it('should show error if cb is called multiple times in async-flow', function (done) {
    y2(function *() {

      var cb = yield;

      cb(null, 'result one');
      var resultOne = yield setTimeout(function () {
        expect(function () {
          cb();
        }).to.throw('Callback is called twice');

        return done();
      }, 100);

    });
  });

  it('should do something when generator returns before callback in sync-flow', function (done) {

    try {
      y2(function *() {
        var cb = yield;

        cb(null, 'result one');

        return;
      });
    } catch(e) {
      expect(e.message).to.include('Generator has no second yield statement');
      return done();
    }

  });

  it('should do something when generator returns before callback in async-flow', function (done) {

    try {

      y2(function *() {
        var cb = yield;

        setTimeout(function () {
          cb(null, 'result one');
        }, 100);
        

        return;
      });

    } catch (e) {
      expect(e.message).to.include('Generator has no second yield statement');
      return done();
    }

  });

  it('should handle errors correctly');

  it('should give error that function is not a generator', function () {
    expect(function () {
      y2(function () {});
    }).to.throw('Function is not a Generator');

  });

});
