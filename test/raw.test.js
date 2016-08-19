describe('raw.test.js', function () {
  var expect = chai.expect;
  var RAW = o_o.RAW;

  var asyncWithError = function (id, cb) {
    setTimeout(function () {
      var err = new Error('Error');
      return cb(err, id);
    }, 40);
  };

  it('should return array with error and result', o_o(function* () {
    var id = Math.random() * 10000;
    var arr = yield asyncWithError(id, yield RAW);

    expect(arr.length).to.be.equal(2);
    expect(arr[1]).to.be.equal(id);
  }));
});
