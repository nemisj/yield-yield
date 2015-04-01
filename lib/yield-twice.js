'use strict';
(function (namespace) {

  // trying to create generator in order to know the Generator constructor
  var OGenerator;

  try {
    OGenerator = function*(){};
  } catch (e) {
    var msg = 'yield-yield: Generators are not supported';
    if (typeof console !== 'undefined') {
      console.error(msg);
    } else {
      alert(msg);
    }

    return;
  }

  var promiser = function promiser(gen, promise, cb) {
    // it's a promise
    promise.then(function onSuccess(value) {
      try {
        var v = gen.next([null, value]);
      } catch (e) {
        cb(e);
        return;
      }

      cb(null, v);
      // separate return after cb in order to not return anything into the
      // Promise
      return;
    }, function onError(error) {
      try {
      var v = gen.next([error]);
      } catch (e) {
        cb(e);
        return;
      }

      cb(null, v);
    });
  };

  var counter = 0;
  var twicer = function twicer(gen, cb) {

    var secondYieldCalled = false;
    var cbCalled = false;
    var callbackReturnValue;
    var stop = false;
    var returnFromGen;
    var v;

    counter++;

    // callback which is returned when yield is called for the first time
    var yieldCallback = function () {
      var msg;
      if (stop) {
        // just do nothing, generator is stopped due to some error
        return;
      } else if (cbCalled) {
        msg = 'Callback is called twice. This is not good';
        // XXX: it's also possible that cb is also called a couple of times?
        return cb(new Error(msg));
      }

      // callback is called,
      // test if it has been called before the second yield or after
      cbCalled = true;

      callbackReturnValue = Array.prototype.slice.call(arguments);
      // callbackReturnValue is an array
      // add extra information to it, so that we can unwrap it when using with
      // the simple callback
      callbackReturnValue.unwrap = true;

      // if geneartor was already postponed, but the second yield statement
      // execute next()
      if (!secondYieldCalled) {
        // yield is not called yet
        // so waiting till it will resume
        return;
      }

      try {
        v = gen.next(callbackReturnValue);
      } catch (e) {
        // this can happen
        // after the second yield and next return/yield statement
        return cb(e);
      }

      // ok, this is already the next call to the yield, not ours
      return cb(null, v);
    };

    // Step 1: requesting callback
    try {
      returnFromGen = gen.next(yieldCallback);
    } catch (e) {
      // code might break in the normal loop
      // before second callback is called
      cb(e);
      return;
    }

    // putting flag, that second yield have been called
    secondYieldCalled = true;

    // Generator could exit using return, so testing result
    if (returnFromGen.done) {
      stop = true;
      return cb(new Error('Generator has no second yield statement. Using yield-yield is useles'));
    }


    if (!cbCalled) {
      // second yield is called, but our yieldCallback still not
      // waiting in the callback till this will happen and execute the .next
      return;
    }

    //if cb is already called, execute .next
    // resume the second yield statement
    try {
      v = gen.next(callbackReturnValue);
    } catch (e) {
      // this error might happen between second yield and the return/yield
      // statement
      return cb(e);
    }

    return cb(null, v);
  };


  function yieldTwice(Gen, args) {

    var cb;
    var finalCallback;

    // take the last argument as callback, and all other stuff pass as
    // arguments to Gen
    args = args.slice();

    if (Gen.length === (args.length - 1)) {
      // doing magic
      cb = args[args.length - 1];
      if (typeof cb === 'function') {
        // great, real magic
        args.pop();
        finalCallback = function () {
          // detach final callback from the thread
          // in order not to catch any errors in here
          var recivedArgs = arguments;
          // make it one-time call
          finalCallback = function () {};
          setTimeout(function () {
            cb.apply(this, recivedArgs);
          }, 0);

          return;
        };
      }
    } else {
      // arguments mismatch
      finalCallback = function () {};
    }

    var gen = Gen.apply(this, args);

    // starts the Generator
    try {
      // first error before any yield will be called
      var result = gen.next();
    } catch (e) {
      return finalCallback(e);
    }

    var testValue = function (e, retValue) {
      if (e) {
        finalCallback(e);
        return;
      }

      var realValue = retValue.value;

      // test if the generator has exit
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
        // it's not return, but yield

        if (typeof realValue === 'undefined') {
          // this is a twicer, first callback
          // which means, that we pass the cb to the first yield 
          // and returns value in the second yield
          twicer(gen, testValue);
        } else if (typeof realValue.then === 'function') {
          promiser(gen, realValue, testValue);
        }

      }

    };

    testValue(null, result);

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
})();
