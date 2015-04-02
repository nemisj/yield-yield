# var o_o = yield (yield)(); [![Build Status](https://travis-ci.org/nemisj/yield-yield.svg?branch=master)](https://travis-ci.org/nemisj/yield-yield)

Double yield (yield-yield) helps you to organize your asynchronous callback code like this:

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

In its purest form double yield give you the possibility to use the good old style node.js functions synchronously without transforming them into anything different, like `fs.sync.readFile(inputFile)` or `fs.readFile.bind(fs, inputFile)` or even `thunkify(fs.readFile.bind(fs))(inputFile)` and `Promise.promisify(fs.readFile)(inputData)`.

There is competely no need in changing callable functions or wrapping them. Double yield provides the generator runner, which allows you to run asynchronous code and sturcture it as if it is synchronous.


```javascript
var superagent = require('superagent');
var o_o = require('yield-yield');
var fs = require('fs');

module.exports = o_o(function *() {
    var fileResult = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
    // fileResult is an array represeting return values of the fs.readFile, 
    // fileResult = [ err, data ]
    var data = fileResult[1];

    var requestResult = yield request
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' })
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end(yield);

    // requestresult will hold the return values of superagent
    // [ err, response ]
    var responseBody = requestResult[1];
    
    return [ data, responseBody];
});
```

While its main purpose is to work with pure callback systems, it can be also used with the promises.

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

In this way you don't have to rewrite your promised functions in order to use them insie yield-yield runner.

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

