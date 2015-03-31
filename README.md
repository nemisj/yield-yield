# var o_o = yield (yield)();

This is small library for making node-style calls synchronous without transforming them
into anything different. I call it yield-yield ( double yield ) and it looks
like this:

  var result = yield fs.readFile('/etc/hosts', { encoding: 'utf8'}, yield);
  // result is an array represeting return values of the fs.readFile, 
  // result = [ err, data ]

It can be applied to any function which excepts callbacks by passing yield
instead of the callback, and pausing thread using the second call.

Just another example, to make it clear.

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

Or with the setTimeout:

  var cb = yield;
  setTimout(function () {
    cb(null, 'Some arguments');
  }, 10);

  var result = yield;
  // result is going to be [ null, 'Some arguments' ];

As you can see, defining the borders of asynchronous code we can structure it
to look and work synchronously.



