/*eslint no-undef:0*/
'use strict';
window.__filename = '';
window.require = function (module) {
  if (module === 'fs') {
    return {
      readFile: function (name, ops, cb) {
        setTimeout(function () {
          return cb(null, 'describe');
        }, 50);
      }
    };
  } else if (module == 'promise') {

    // promise mock
    return function (provider) {
      var d = {
        setValue: function (value) {
          this._value = value;
          this.exec();
        },
        setError: function (value) {
          this._error = value;
          this.exec();
        },

        setCallback: function (value) {
          this._callback = value;
          this.exec();
        },

        setErrback: function (value) {
          this._errBack = value;
          this.exec();
        },

        exec: function () {
          this._exec('_value', '_callback');
          this._exec('_error', '_errBack');
        },

        _exec: function (valueName, callbackName) {
          var cb;
          if (typeof this[valueName] != 'undefined') {
            if (typeof this[callbackName] != 'undefined') {
              cb = this[callbackName];
              this[callbackName] = null;
              cb(this[valueName]);
            }
          }
        },

        then: function (callBack, errBack) {
          this.setCallback(callBack);
          this.setErrback(errBack);
        }
      };

      var resolve = function (value) {
        d.setValue(value);
      };

      var reject = function (value) {
        d.setError(value);
      };

      try {
        provider(resolve, reject);
      } catch (e) {
        d.setError(e);
      }

      return d;
    };
  }
};
