/*eslint-env node*/
'use strict';

describe('Promise', function () {
  
  var yy = require('yield-twice');
  var fs = require('fs');
  var expect = require('chai').expect;
  var promise = require('promise');

  it('should run as promise', function (done) {


    var getUsername = function () {
      var p = new Promise(function (res, rej) {
        setTimeout(function () {
          rej('Maks Nemisj');
        }, 50);
      });
      return p;
    };

    var r = yy(function *() {
      var name = yield getUsername();
    });

    r(function (err) {
      console.log('bla', err);
    });

  });

});
