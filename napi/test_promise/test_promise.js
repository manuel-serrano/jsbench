'use strict';

// This tests the promise-related n-api calls
const { inspect } = require('util');

const test_promise = require(`./build/Release/test_promise`);
let res = true;

let K = 0;

function check_error() {
/*    K++;                                                             */
/*    if (!res) {                                                      */
/*       console.error("error ", K);                                   */
/*       process.exit(0);                                              */
/*    }                                                                */
}

const assert = {
   ok: v => res = res && v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b) || (Number.isNaN(a) && Number.isNaN(b)); check_error();},
   notStrictEqual: (a, b) => { res = res && (a !== b); check_error();},
   deepStrictEqual: (a, b) => { 
      Object.keys(a).forEach(k => {
	 const ak = a[k];
	 const bk = b[k];
	 res = res && ((ak instanceof Array) || (ak instanceof Object)) ? assert.deepStrictEqual(ak, bk) : (ak === bk); 
      }); 
      check_error();
      return res;
   },
   notDeepStrictEqual: (a, b) => !assert.deepStrictEqual(a, b)
}

const noop = () => {};

const mustCallChecks = [];

function runCallChecks(exitCode) {
  if (exitCode !== 0) return;

  const failed = mustCallChecks.filter(function(context) {
    if ('minimum' in context) {
      context.messageSegment = `at least ${context.minimum}`;
      return context.actual < context.minimum;
    }
    context.messageSegment = `exactly ${context.exact}`;
    return context.actual !== context.exact;
  });

  failed.forEach(function(context) {
    console.log('Mismatched %s function calls. Expected %s, actual %d.',
                context.name,
                context.messageSegment,
                context.actual);
    console.log(context.stack.split('\n').slice(2).join('\n'));
  });

  if (failed.length) process.exit(1);
}

function mustCall(fn, exact) {
  return _mustCallInner(fn, exact, 'exact');
}

function mustSucceed(fn, exact) {
  return mustCall(function(err, ...args) {
    assert.ifError(err);
    if (typeof fn === 'function')
      return fn.apply(this, args);
  }, exact);
}

function mustCallAtLeast(fn, minimum) {
  return _mustCallInner(fn, minimum, 'minimum');
}

function _mustCallInner(fn, criteria = 1, field) {
  if (process._exiting)
    throw new Error('Cannot use common.mustCall*() in process exit handler');
  if (typeof fn === 'number') {
    criteria = fn;
    fn = noop;
  } else if (fn === undefined) {
    fn = noop;
  }

  if (typeof criteria !== 'number')
    throw new TypeError(`Invalid ${field} value: ${criteria}`);

  const context = {
    [field]: criteria,
    actual: 0,
    stack: inspect(new Error()),
    name: fn.name || '<anonymous>',
  };

  // Add the exit listener only once to avoid listener leak warnings
  if (mustCallChecks.length === 0) process.on('exit', runCallChecks);

  mustCallChecks.push(context);

  const _return = function() { // eslint-disable-line func-style
    context.actual++;
    return fn.apply(this, arguments);
  };
  // Function instances have own properties that may be relevant.
  // Let's replicate those properties to the returned function.
  // Refs: https://tc39.es/ecma262/#sec-function-instances
  Object.defineProperties(_return, {
    name: {
      value: fn.name,
      writable: false,
      enumerable: false,
      configurable: true,
    },
    length: {
      value: fn.length,
      writable: false,
      enumerable: false,
      configurable: true,
    },
  });
  return _return;
}

function getCallSite(top) {
  const originalStackFormatter = Error.prepareStackTrace;
  Error.prepareStackTrace = (err, stack) =>
    `${stack[0].getFileName()}:${stack[0].getLineNumber()}`;
  const err = new Error();
  Error.captureStackTrace(err, top);
  // With the V8 Error API, the stack is not formatted until it is accessed
  err.stack; // eslint-disable-line no-unused-expressions
  Error.prepareStackTrace = originalStackFormatter;
  return err.stack;
}

function mustNotCall(msg) {
  const callSite = getCallSite(mustNotCall);
  return function mustNotCall(...args) {
    const argsInfo = args.length > 0 ?
      `\ncalled with arguments: ${args.map((arg) => inspect(arg)).join(', ')}` : '';
    assert.fail(
      `${msg || 'function should not have been called'} at ${callSite}` +
      argsInfo);
  };
}

const common = {
   mustCall: mustCall,
   mustNotCall: mustNotCall
};

function test() {
   // A resolution
   {
      const expected_result = 42;
      const promise = test_promise.createPromise();
      promise.then(
    	 common.mustCall(function(result) {
      	    assert.strictEqual(result, expected_result);
    	 }),
    	 common.mustNotCall());
      test_promise.concludeCurrentPromise(expected_result, true);
   }

   // A rejection
   {
      const expected_result = 'It\'s not you, it\'s me.';
      const promise = test_promise.createPromise();
      promise.then(
	 common.mustNotCall(),
	 common.mustCall(function(result) {
	    assert.strictEqual(result, expected_result);
	 }));
      test_promise.concludeCurrentPromise(expected_result, false);
   }

   // Chaining
   {
      const expected_result = 'chained answer';
      const promise = test_promise.createPromise();
      promise.then(
	 common.mustCall(function(result) {
	    assert.strictEqual(result, expected_result);
	 }),
	 common.mustNotCall());
      test_promise.concludeCurrentPromise(Promise.resolve('chained answer'), true);
   }

   const promiseTypeTestPromise = test_promise.createPromise();
   assert.strictEqual(test_promise.isPromise(promiseTypeTestPromise), true);
   test_promise.concludeCurrentPromise(undefined, true);

   const rejectPromise = Promise.reject(-1);
   const expected_reason = -1;
   assert.strictEqual(test_promise.isPromise(rejectPromise), true);
   rejectPromise.catch((reason) => {
      assert.strictEqual(reason, expected_reason);
   });

   assert.strictEqual(test_promise.isPromise(2.4), false);
   assert.strictEqual(test_promise.isPromise('I promise!'), false);
   assert.strictEqual(test_promise.isPromise(undefined), false);
   assert.strictEqual(test_promise.isPromise(null), false);
   assert.strictEqual(test_promise.isPromise({}), false);
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test();
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 50000;

main("test_promise", N); 
