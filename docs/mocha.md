# Yield-yield and mocha

You can run mocha tests and use yield-yield for asynchronouse tests. 

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

As you can see, no done is required, just wrap the function into the sync and
make generator of it.

To run the code please pass the --harmony flag to the mocha

```javascript
mocha --harmony
```
