'use strict';

// trying to create generator in order to know the Generator constructor
var OGenerator = function*(){};

var promised = function promised(gen, cb) {
};

var counter = 0;
var twicer = function twicer(gen, cb) {
  counter++;

  var yieldCalled = false;
  var cbCalled = false;
  var retValue;
  var stop = false;

  // requesting callback
  var result = gen.next(function () {
    if (stop) {
      // just do nothing, generator is stoped due to the no second yield
    } else if (cbCalled) {
      var msg = 'Callback is called twice. This is not good';
      // console.error(msg);
      return cb(new Error(msg));
    }

    // callback is called, test if it has been called before the yield or
    // after 
    retValue = Array.prototype.slice.call(arguments);
    // retValue is an array
    // add extra information to it, so that we can unwrap it when using with
    // the simple callback
    retValue.unwrap = true;

    cbCalled = true;
    // if geneartor was already postponed
    // execute next,
    // otherwise don't
    if (yieldCalled) {
      var v = gen.next(retValue);
      // ok, this is already the next call to the yield, not ours
      return cb(null, v);
    } else {
      // yield is not called yet
      // so waiting till it will resume
    }

  });

  // it's also possible that generator has ended, so testing result
  if (result.done) {
    stop = true;
    return cb(new Error('Generator has no second yield statement. Usage of yield-twice is useles'));
  }

  yieldCalled = true;

  // async flow
  if (cbCalled) {
    // check, cb is already called, and the second yield is also called
    // so now call next with the retValue
    var v = gen.next(retValue);
    return cb(null, v);
  } else {
    // now, wait for the second, yield which is needed to stop the process and
    // wait when callback is going to be called
    // we don't care what user will pass to the second yield, it only waits for
    // the callback

  }

};


function yieldTwice(Gen, args) {

  // take the last argument as callback, and all other stuff pass as
  // arguments to Gen
  args = args.slice();
  var cb = args.pop();

  if (typeof cb != 'function') {
    cb = function () {};
  }

  var finalCallback = function () {
    // detach final callback from the thread
    // in order not to catch any errors in here
    var args = arguments;
    // make it one-time call
    finalCallback = function () {};
    setTimeout(function () {
      cb.apply(this, args);
    }, 0);
    return;
  };

  var gen = Gen.apply(this, args);

  // starts the Generator
  try {
    var result = gen.next();
  } catch (e) {
    return finalCallback(e);
  }

  var testValue = function (e, retValue) {
    if (e) {
      // throw it here and stop
      throw e;
    }

    var realValue = retValue.value;

    // test if the generator has quite
    if (retValue.done) {
      // generator is done
      // if realValue has unwrap boolean
      // then apply arguments asif they're real args
      if (typeof realValue == 'undefined') {
        return finalCallback();
      } else if (realValue.unwrap) {
        // unwrap value, since it's internal arguments
        return finalCallback.apply(this, realValue);
      } else {
        return finalCallback(null, realValue);
      }

    } else {

      if (typeof realValue === 'undefined') {
        // this is a twicer
        // which means, that we pass the cb to the first yield 
        // and returns value in the second yield
        twicer(gen, testValue);
      } else if (typeof realValue.then === 'function') {
        // it's a promise
        realValue.then(function (value) {
          var v = gen.next(value);
          testValue(null, v);
          // separate return after cb in order to not return anything into the
          // Promise
          return;
        }, function (error) {
          // stop generator?
          gen.throw(error);
        });
      }

    }

  };

  try {
    testValue(null, result);
  } catch (e) {
    // detach from the main thread
    return finalCallback(e);
  }

};

module.exports = function (Gen) {
  if (Gen.constructor != OGenerator.constructor) {
    throw new Error('Function is not a Generator');
  }

  var fnc = function (cb) {
    var args = Array.prototype.slice.call(arguments);
    yieldTwice(Gen, args);
  };

  fnc.run = function () {
    return fnc(function (err) {
      if (err) {
        throw err;
      }
    });
  };

  return fnc;
};
