var y = require('yield-yield');

module.exports = y(function *() {

  var start = new Date().getTime();
  var cb = yield;

  var [ err, end ] = yield setTimeout(function () {
    var endTime = new Date().getTime();
    cb(null, endTime);
  }, 100);

  return end - start;

});
