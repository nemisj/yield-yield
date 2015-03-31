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

In its purest form yield-yield gives the possibility to use the good old style node.js functions synchronously without transforming them into anything different.


```javascript
    var result = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
    // result is an array represeting return values of the fs.readFile, 
    // result = [ err, data ]
```

It can be applied to any function which expects callback just by passing yield
instead of the callback, and pausing the execution flow by using the second yield statement.

Anything between two yield statements can be asynchronous.

```javascript
    var cb = yield;
    setTimout(function () {
      cb(null, 'Some arguments');
    }, 10);

    var result = yield;
    // result is going to be [ null, 'Some arguments' ];
```

Yet another example, to make it clear.

```javascript
    var superagent = require('superagent');

    var result = yield request
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' })
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end(yield);

    var res = result[[1];

    if (res.ok) {
      alert('yay got ' + JSON.stringify(res.body));
    } else {
      alert('Oh no! error ' + res.text);
    }
```

As you can see, defining the borders of asynchronous code we can structure it
to look and work with it synchronously.


While it's main purpose to work with pure callback systems, it can be also used
with the promises.


```javascript
var Promise = require('promise');

var result = yield new Promise(function (resolve, reject) {
  setTimout(function () {
    return resolve('some-value');
  }, 10);
});

// flow will wait till the promise will resolve and return value which
// is going to be 'some-value'
```

# API

In order to work this double-yield generator must be created using the
yield-yield function

```javascript

var o_o = require('yield-yield');
var wrapper = o_o(function *() {
  return yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
});

wrapper(function (err, data) {
});

```

By having a wrapper which is also the pure callback style function, you can
integrate it into the current code without re-write the whole code to support
of generators.

