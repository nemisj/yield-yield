# API

## o_o.run()

In order to run generated functionss directly, use `run()` method

```javascript
o_o.run(function *main() {
  var content = yield fs.readFile(p, yield);
  console.log(content);
});
```

## Nested generators

`yield-yield` supports nested generators

```javascript
function *one() {
 var result = yield superagent
  .get(url)
  .end(yield);

  return result.body;
}

o_o.run(function *main() {
  var bodyResult = yield one();
  console.log(bodyResult);
});
```


## import { RAW } from 'yield-yield'

There are situations when callback is called with error and another result. In such situations it might be usefull to get both results back. Normally  `yield-yield` throws an error when first argument is an error object. To overcome this limitation, there is a flag introduced in v1.2.0, which will instruct `yield-yield` to return all the values from the callback in an array:

```javascript
var o_o = require('yield-yield');
var RAW = o_o.RAW;

function asyncWithError(cb) {
  setTimeout(function () {
    return cb(new Error('Error'), 'Two');
  }, 40);
};

var arr = yield asyncWithError(yield RAW);
// arr will be [ Error, 'Two' ]
```

## import { QCOLLECT, QRUN } from 'yield-yield'

It's possible to use `yield-yield` to run asynchronous functions
in parralel without blocking the flow and wait for the result from all of them, like
`Promise.all` or `async.parallel` are doing. For that `QRUN` and `QCOLLECT`flags
should be used.

```javascript
function getBody(url, cb) {
 superagent
  .get(url)
  .end(function (err, res) {
    return cb(err, res && res.body);
  });
}

getBody('http://nemisj.com', yield QRUN);
getBody('http://yahoo.com', yield QRUN);

var results = yield QCOLLECT;

// results going to be array of arrays,
// each run having own resultSet with arguments passed to the cb
// [ [ null, htmlOfNemisj.com ], [ null, htmlOfYahoo ] ]
```
