/*eslint-env node*/
/*global o_o, expect*/
'use strict';

describe('promise.test.js', function () {

  var expect = chai.expect;

  it('should run promise and return its value', function (done) {

    var getUsername = function () {
      var deferred = Q.defer();

      setTimeout(function () {
        deferred.resolve('Maks Nemisj');
      }, 50);

      return deferred.promise;
    };

    var fnc = o_o(function *() {
      var result = yield getUsername();
      expect(result).to.be.equal('Maks Nemisj');
    });

    fnc(function (err) {
      expect(err).to.be.not.ok;
      return done();
    });

  });

  it('should run promise and return error if occured', function (done) {
    var message = 'Promise Error #' + ~~(Math.random() * 1000);

    var getUsername = function () {
      var deferred = Q.defer();

      setTimeout(function () {
        deferred.reject(message);
      }, 50);

      return deferred.promise;
    };

    var fnc = o_o(function *() {
      // this one will throw error and willstop
      var result = null;
      try {
        yield getUsername();
      } catch (e) {
        result = e;
      }

      expect(result).to.be.equal(message);

    });

    fnc(done);

  });
});
