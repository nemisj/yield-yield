# Yield-yield in combination with Babel

It's very easy to use yield-yield with [babel](https://babeljs.io/). yield-yield and babel will not conflict.

In case of running yield-yield in combination with babel you don't have to run node process with --harmony flag, babel will compile everything into the es5 compatible code.

The syntax will look exactly the same;

```javascript
var superagent = require('superagent');
var sync = require('yield-yield');
var fs = require('fs');

module.exports = sync(function *() {

    //
    // Read file from fs
    //
    var content= yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);

    //
    // Make the request to the server
    //
    var response = yield superagent
      .get('/api/pet')
      .end(yield);

});
```

