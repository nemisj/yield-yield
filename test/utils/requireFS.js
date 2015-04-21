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
  }

  throw new Error('Unable to create mock for ' + module);
};
