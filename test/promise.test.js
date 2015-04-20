/*eslint-env node*/
/*global o_o, expect*/
'use strict';

describe('Promise', function () {

  var expect = chai.expect;
  var Promise = require('promise');

  it('should run promise and return its value', function (done) {

    var getUsername = function () {
      var p = new Promise(function (res, rej) {
        setTimeout(function () {
          res('Maks Nemisj');
        }, 50);
      });
      return p;
    };

    var fnc = o_o(function *() {
      var result = yield getUsername();
      expect(result[1]).to.be.equal('Maks Nemisj');
    });

    fnc(function (err) {
      expect(err).to.be.not.ok;
      return done();
    });

  });

  it('should run promise and return error if occured', function (done) {
    var message = 'Promise Error #' + ~~(Math.random() * 1000);

    var getUsername = function () {
      var p = new Promise(function (res, rej) {
        setTimeout(function () {
          rej(message);
        }, 50);
      });
      return p;
    };

    var fnc = o_o(function *() {
      // this one will throw error and willstop
      var result = yield getUsername();
      expect(result[0]).to.be.equal(message);
    });

    fnc(function (err) {
      expect(err).to.be.not.ok;
      return done();
    });
  });
});
