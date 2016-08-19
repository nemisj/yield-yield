# API

## import { RAW } from 'yield-yield'

There are situations when callback is called with error and another result, for
example like superagent is doing. In such situations it might be usefull to get
both results back. Normally whenever using `yield-yield` and callback is called
with error, then error will be thrown back and there is no reference to other
values. To overcome this limitation, there is a new flag introduced, which will
instruct `yield-yield` to return all the values from the callback.

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

