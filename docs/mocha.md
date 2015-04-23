# Yield-yield and mocha

You can run mocha tests and use yield-yield for asynchronous testing. Wrap your function inside yield-yield and write code asif it's a normal flow.

```javascript
var sync = require('yield-yield');
describe('testing', function () {

  it('will run async', sync(function *() {

    var start = new Date().getTime();

    yield setTimeout(yield, 100);

    var end = new Date().getTime();

    expect(end - start >= 100).to.be.true;

  });

});
```

As you can see, no done is required, just wrap the function into the sync and make generator of it. yield-yield will execute the mocha callback whenever your code is ready. Also don't be afraid to throw exceptions in the generator itself, whenever something is wrong. Mocha will recognize it and will mark test as failed.

To run the code please pass the --harmony flag to the mocha

```javascript
mocha --harmony
```
