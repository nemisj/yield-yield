# var o_o = yield (yield)(); [![Build Status](https://travis-ci.org/nemisj/yield-yield.svg?branch=master)](https://travis-ci.org/nemisj/yield-yield)

[![NPM](https://nodei.co/npm/yield-yield.png)](https://npmjs.org/package/yield-yield)

Double yield (yield-yield) is a library that helps organize asynchronous callback code, like this:

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

into something like this one:

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

In its purest form double yield (yield-yield) gives the possibility to use the good old error-first callbacks synchronously without transforming them into anything different, like `fs.sync.readFile(inputFile)`, `fs.readFile.bind(fs, inputFile)`, `thunkify(fs.readFile.bind(fs))(inputFile)` or `Promise.promisify(fs.readFile)(inputData)`.

There is completely no need in changing callable functions or wrapping them. Double yield (yield-yield) provides the generator runner, which allows you to run asynchronous code and structure it as if it is synchronous.

```javascript
var superagent = require('superagent');
var o_o = require('yield-yield');
var fs = require('fs');

module.exports = o_o(function *() {

    var fileResult = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
    // fileResult is an array represeting return values of the fs.readFile, 
    // fileResult = [ err, data ]
    var data = fileResult[1];
    
    //
    // let's pause for a second
    //
    yield setTimeout(yield, 1000);

    //
    // make the request to the server
    //
    var requestResult = yield request
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' })
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end(yield);

    // requestresult will hold the return values of superagent
    // [ err, response ]
    var responseBody = requestResult[1];
    
    //
    // return results
    //
    return [ data, responseBody];
});
```

While its main purpose is to work with pure callback style systems, it can be also used with the promises.

```javascript
var Promise = require('promise');
var o_o = require('yield-yield');
var express = require('express');

var app = express();

var getFile = function (inputFile) {
  return new Promise(function (resolve, reject) {
    fs.readFile(inputFile, function (err, data) {
      if (err) { return reject(err); }
      return resolve(data);
    });
  });
}

app.post('/process-file', o_o(function* (req, res) {
  var result = yield getFile(req.url);
  // result will be [err, data]
});
```

In this way there is no need to rewrite existing promised functions in order to use them inside double yield (yield-yield) runner.

# API

## Basics

To start using double yield (yield-yield), generator must be given to the yield-yield runner, which in turns will return usual function. After that, this function can be called to start the generator.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var result = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
  // do somehting with result
  
});

wrapper();
```

All the code inside generator can be written synchronously using doudble yield contsructs. First `yield` returns the callback, and the second `yield` returns the result of the first callback. In its simpelest form, it looks like this:

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var cb = yield;
  cb('arg1', 'arg2');
  var result = yield;
  // result will be an array:
  // [ 'arg1', 'arg2'];
});

wrapper();
```

It doesn't matter whether cb is called directly or asynchronously, second `yield` statement will wait till the callback is called, and won't go further till that moment. For example, to pause the execution of the code, you can use old-schoool setTimeout method in conjuncition with double yield.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  console.log('Starting the code');
  
  yield setTimeout(yield, 1000);
  
  console.log('Thousands milliseconds later...');
});

wrapper();
```

Here is another example to make it clear, that it's possible to cache the callback of the yield, if this is needed.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  console.log('Starting the code');
  var cb = yield;
  setTimeout(function () {
    cb();
  }, 1000);
  
  //
  // This yield ensures that thread is paused till the cb is called
  //
  yield;
  
  console.log('Thousands milliseconds later...');
});

wrapper();
```


## Execution possibilities

Function which is returned by the factory, accepets the arguments and passes them directly to the generator.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName) {
  var result = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
});

wrapper('/etc/hosts');
```

In the same way it's possible to pass a callback as argument, to get the notification when generator is done.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName, cb) {
  var result = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
  
  return cb(result);
});

wrapper('/etc/hosts', function (res) {
  console.log('File is fetched');
});
```

It's not possible to rely on synchorous flow when calling `wrapper`. Because in itself the generator is still asynchronous. This means that the following code will not work:

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName) {
  var result = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
});

wrapper('/etc/hosts');
// this will not work
console.log('After generator is done');
```

For that reason, to get the status, when the code inside the generator is done, callback CAN be used.


Yes, it's right. CAN and not MUST. Becasue, to make life of the developers easier, there is an automatic callback functionality present in the generator. Whenever the callback is given to the **created** function, but NOT to the generator, doudble yield ( yield-yield ) will automatically call that callback at the end.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName) {
  var result = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
});

wrapper('/etc/hosts', function () {
  // this DOES work
  console.log('After generator is done');
});
```

Not only double yield supports implicit callbacks, it also supports the return values of the generator. Whenever generator returns value, it will be available in the implicit callback call.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  return ['a', 'b'];
});

wrapper(function (result) {
  // result will be an array with:
  // [ 'a', 'b' ]
});
```

Yet, if the result is returned directly from the last yield, then it will be automatically unwrapped to the arguments.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var result = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
  // do somehting with result
  return result;
});

wrapper(function (err, data) {
  // err will be the error of the fs.readFile
  // data will be the content of the file
});
```

This means that double yield is return agnostig, and based on the value source, it will or will not unwrap the array.

# Exceptions

Most all of the exceptions which occure inside the generator, are returned back to the implicit callback as first argument. ( This in order to support node.js style error-first callbacks )

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  throw new Error('Hello error');
});

wrapper(function (err) {
  // err will contain Error object
});
```

The only exceptions which are not caught are the exceptions, which occures inside the other callbacks. They will just dissapear inside the global universe. The next code will not pass any error to the callback.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var cb = yield;
  
  yield setTimeout(function () {
    throw new Error('Hello error');
  }, 1000));
  
});

wrapper(function (err) {
  // err will be empty
});
```


