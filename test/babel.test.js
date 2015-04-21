/*eslint-env mocha,node*/
var babel = require('babel-core');
var vm = require('vm');
var expect = chai.expect;

describe('babel', function () {
  it('should work together with babel/register', function (done) {

    var resolvedPath = require.resolve('./utils/babel.mock.js');
    var result = babel.transformFileSync(resolvedPath, {
      optional: 'runtime'
    });

    var childModule = {};

    // evaluating module
    vm.runInNewContext(result.code, {
      require: require,
      y: require('yield-yield'),
      module: childModule,
      setTimeout: setTimeout
    });

    childModule.exports(function (err, result) {

      expect(err).to.be.not.ok;
      expect(result > 100).to.be.true;

      return done();
    });

  });
});
