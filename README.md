# var o_o = yield (yield)(); [![Build Status](https://travis-ci.org/nemisj/yield-yield.svg?branch=master)](https://travis-ci.org/nemisj/yield-yield)

[![NPM](https://nodei.co/npm/yield-yield.png)](https://npmjs.org/package/yield-yield)

Double yield ( yield-yield ) helps you to organize asynchronously written code by structuring it sequentially.

```javascript
var superagent = require('superagent');
var o_o = require('yield-yield');
var fs = require('fs');

module.exports = o_o(function *() {

    //
    // Read file from fs
    //
    var fileResult = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);

    //
    // Pause for a second
    //
    yield setTimeout(yield, 1000);

    //
    // Make the request to the server
    //
    var requestResult = yield superagent
      .get('/api/pet')
      .end(yield);

    //
    // Do some more  async stuff
    //

});
```

[Read full Documentation](https://github.com/nemisj/yield-yield/docs/README.md)
