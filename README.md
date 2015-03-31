# var o_o = yield (yield)();

Yield-yield transforms your code which looks like this:

```javascript
var express = require('express');  
var fs = require('fs');  
var app = express();

app.post('/process-file', function(req, res) {  
  var inputFile = 'input.txt';
  var outputFile = 'output.txt';

  fs.readFile(inputFile, function(err, data) {
    if (err) return res.status(500).send(err);

    process1(data, function(err, data) {
      if (err) return res.status(500).send(err);

      process2(data, function(err, data) {
        if (err) return res.status(500).send(err);

        process3(data, function(err, data) {
          if (err) return res.status(500).send(err);

          fs.writeFile(outputFile, data, function(err) {
            if (err) return res.status(500).send(err);

            res.status(200).send('processed successfully using callback hell');
          });
        });
      });
    });
  });
});
```
( code taken from the http://blog.vullum.io/javascript-flow-callback-hell-vs-async-vs-highland/ )

Into something like this:

```javascript
var express = require('express');  
var fs = require('fs');  
var app = express();
var o_o = require('yield-yield');

app.post('/process-file', o_o(function* (req, res) {  
  var inputFile = 'input.txt';
  var outputFile = 'output.txt';
  
  var res = yield fs.readFile(inputFile, yield);
  if (res[0]) return res.status(500).send(err);
  
  res = yield process1(data, yield);
  if (res[0]) return res.status(500).send(err);
  
  res = yield process2(data, yield);
  if (res[0]) return res.status(500).send(err);
  
  res = yield process3(data, yield);
  if (res[0]) return res.status(500).send(err);
  
  res = yield fs.writeFile(outputFile, yield);
  if (res[0]) {
    return res.status(500).send(err); 
  }
  
  res.status(200).send('processed successfully using yield-yield');

}));
```

## Intro

In its purest form yield-yield gives the possibility to use the good old style node.js functions synchronously without transforming them into anything different, like `fs.sync.readFile(inputFile)` or `fs.readFile.bind(fs, inputFile)` or even `thunkify(fs.readFile.bind(fs))(inputFile)` and `Promise.promisify(fs.readFile)(inputData)`.

There is competely no mocking around with your functions at all. Only what this libraryr is giving is the runner, whic allows you to run code asynchronous but sturcturing it synchronously.


```javascript
var superagent = require('superagent');
require('yield-yield')(function *() {
    var fileResult = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
    // fileResult is an array represeting return values of the fs.readFile, 
    // fileResult = [ err, data ]

    var requestResult = yield request
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' })
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end(yield);

    // requestresult will hold the return values of superagent
    // [ err, response ]

});
```

It can be applied to any function which expects callback just by passing yield
instead of the callback, and pausing the execution flow by using the second yield statement. 

```javascript
    var cb = yield;
    var result = yield setTimeout(function () {
      cb(null, 'Some arguments');
    }, 10);

    var result = yield;
    // result is going to be [ null, 'Some arguments' ];
```

As you can see, by defining the borders of asynchronous code we can structure it like synchronous code.

While it's main purpose to work with pure callback systems, it can also be used with the promises.

```javascript
var Promise = require('promise');
var o_o = require('yield-yield');
var express = require('express');

var app = express();

var getFile = function () {
  var inputFile = 'input.txt';
  return new Promise(function (resolve, reject) {
    fs.readFile(inputFile, function (err, data) {
      if (err) { return reject(err); }
      return resolve(data);
    });
  });
}

app.post('/process-file', o_o(function* (req, res) {
  var result = yield getFile();
  // result will be [err, data]
});
```

In this way you don't have to rewrite your promised functions either in order to use them insie yield-yield runner.

# API

Whener you would like to use yield-yield style, you need to pass generator to the yield-yield factory  

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var result = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
  // do somehting with result
  
});

```

Factory will return a wrapper, which is also a pure callback style function.
Which means to start generator run the returned function.

```javascript
wrapper();
```

You alos can pass arguments to the generator, which makes it ideal solution for integrating into the current callback styled application.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(arg1) {
  // arg1 will be 'Some value'
});

wraper('Some value');
```

