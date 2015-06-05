# yield-yield 

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
  
  try {
    var res = yield fs.readFile(inputFile, yield);
    res = yield process1(data, yield);
    res = yield process2(data, yield);
    res = yield process3(data, yield);
    res = yield fs.writeFile(outputFile, yield);
  } catch (e) {
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

    var data = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
    
    //
    // let's pause for a second
    //
    yield setTimeout(yield, 1000);

    //
    // make the request to the server
    //
    var response = yield request
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' })
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end(yield);

    //
    // return results
    //
    return [ data, response ];
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
  var data = yield getFile(req.url);
});
```

In this way there is no need to rewrite existing promised functions in order to use them inside double yield (yield-yield) runner.

## Basics

To start using double yield (yield-yield), generator must be given to the yield-yield runner, which in turns will return error-first callback function. After that, this function can be called to start the generator.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var content = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
  // do somehting with result
  
});

wrapper();

```

If readFile will fail this code will throw exception, which means, in order to
catch the errors, it must be wrapped into the try {...} catch () {...}

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  try {
    var content = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
  } catch (e) {
    conosole.error('Unable to read file, because ' + e.message);
  }
  
});

wrapper();

```


## Advanced usage

Function which is returned by the factory, accepts the arguments and passes them directly to the generator.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName) {
  var content = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
});

wrapper('/etc/hosts');
```

In the same way it's possible to pass a callback as argument, to get the notification when generator is done.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName, cb) {
  var content = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
  
  cb(content);
});

wrapper('/etc/hosts', function (res) {
  console.log('File is fetched with content ' + res);
});
```

It's not possible to rely on synchronous flow when calling `wrapper`. Because the generator in itself is still asynchronous. This means that the following code will not work:

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName) {
  console.log('1. Before readFile');

  var result = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result

  console.log('2. After readFile');
});

wrapper('/etc/hosts');

// this will not work
console.log('3. After generator is done');
```

This code would result in:

  1. Before readFile
  3. After generator is done
  2. After readFile

For that reason, to get notified, when the code inside the generator is done, callback CAN be used. Yes, that's right - CAN and not MUST.

There is an automatic callback functionality presents in the generator. Whenever the callback is given to the **created** function, but NOT to the generator, doudble yield ( yield-yield ) will automatically call that callback at the end.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *(fileName) {
  console.log('1. Before readFile');
  var content = yield fs.readFile(fileName, { encoding: 'utf8'}, yield);
  // do somehting with result
  console.log('2. After readFile');
});

wrapper('/etc/hosts', function () {
  // this DOES work
  console.log('3. After generator is done');
});
```

This code would result in:

  1. Before readFile
  2. After readFile
  3. After generator is done

Not only double yield supports implicit callbacks, it also supports the return values of the generator. Whenever generator returns value, it will be available in the callback call as a second argument. 

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  return ['a', 'b'];
});

wrapper(function (err, result) {
  // result will be an array with:
  // [ 'a', 'b' ]
});
```

Because double yield is meant for error-first callback, the first argument is exposing errors, which are not caught inside the generator.

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  throw new Error('Hello error');
});

wrapper(function (err) {
  // err will contain Error object

```

## Using raw generators

In case you use generators only internally then there is no need to wrap the generator inside the factory, but it can be called directly from the other generators runner.

```javascript
var o_o = require('yield-yield');

var raw = function *(a) {
  var content = yield fs.readFile(inputFile, 'utf8', yield);
}

o_o.run(function * () {
  var result = yield raw('a');
});
```

## How does it works?

All the code inside generator can be written synchronously using double yield constructs. First `yield` returns the callback, and the second `yield` returns the result of the first callback. In its simplest form, it looks like this:

```javascript
var o_o = require('yield-yield');

var wrapper = o_o(function *() {
  var cb = yield;
  cb(null, [ 'arg1', 'arg2' ]);

  var result = yield;
  // result will be an array:
  // [ 'arg1', 'arg2'];
});

wrapper();
```

It doesn't matter whether callback (cb) is called directly or asynchronously, second `yield` statement will wait till the callback is called, and won't go further till that moment. For example, to pause the execution of the code, you can use old-schoool setTimeout method in conjunction with double yield.

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
