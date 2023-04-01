'use strict';

const test_error = require(`./build/Release/test_error`);



let res = true;

const assert = {
   ok: v => res = res && v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b) || (Number.isNaN(a) && Number.isNaN(b)); },
   notStrictEqual: (a, b) => { res = res && (a !== b); },
   deepStrictEqual: (a, b) => { Object.keys(a).forEach(k => { res = res && (a[k] === b[k]); }) },
   notDeepStrictEqual: (a, b) => !assert.deepStrictEqual(a, b)
}

const theError = new Error('Some error');
const theTypeError = new TypeError('Some type error');
const theSyntaxError = new SyntaxError('Some syntax error');
const theRangeError = new RangeError('Some type error');
const theReferenceError = new ReferenceError('Some reference error');
const theURIError = new URIError('Some URI error');
const theEvalError = new EvalError('Some eval error');

class MyError extends Error { }
const myError = new MyError('Some MyError');

function test(N) {
   res = true;

   for (let i = 0; i < N; i++) {
      // Test that native error object is correctly classed
      assert.strictEqual(test_error.checkError(theError), true);

      // Test that native type error object is correctly classed
      assert.strictEqual(test_error.checkError(theTypeError), true);

      // Test that native syntax error object is correctly classed
      assert.strictEqual(test_error.checkError(theSyntaxError), true);

      // Test that native range error object is correctly classed
      assert.strictEqual(test_error.checkError(theRangeError), true);

      // Test that native reference error object is correctly classed
      assert.strictEqual(test_error.checkError(theReferenceError), true);

      // Test that native URI error object is correctly classed
      assert.strictEqual(test_error.checkError(theURIError), true);

      // Test that native eval error object is correctly classed
      assert.strictEqual(test_error.checkError(theEvalError), true);

      // Test that class derived from native error is correctly classed
      assert.strictEqual(test_error.checkError(myError), true);

      // Test that non-error object is correctly classed
      assert.strictEqual(test_error.checkError({}), false);

      // Test that non-error primitive is correctly classed
      assert.strictEqual(test_error.checkError('non-object'), false);

      assert.throws(() => {
	 test_error.throwExistingError();
      }, /^Error: existing error$/);

      assert.throws(() => {
	 test_error.throwError();
      }, /^Error: error$/);

      assert.throws(() => {
	 test_error.throwRangeError();
      }, /^RangeError: range error$/);

      assert.throws(() => {
	 test_error.throwTypeError();
      }, /^TypeError: type error$/);

      [42, {}, [], Symbol('xyzzy'), true, 'ball', undefined, null, NaN]
	 .forEach((value) => assert.throws(
	    () => test_error.throwArbitrary(value),
	    (err) => {
	       assert.strictEqual(err, value);
	       return true;
	    }
	 ));

      assert.throws(
	 () => test_error.throwErrorCode(),
	 {
	    code: 'ERR_TEST_CODE',
	    message: 'Error [error]'
	 });

      assert.throws(
	 () => test_error.throwRangeErrorCode(),
	 {
	    code: 'ERR_TEST_CODE',
	    message: 'RangeError [range error]'
	 });

      assert.throws(
	 () => test_error.throwTypeErrorCode(),
	 {
	    code: 'ERR_TEST_CODE',
	    message: 'TypeError [type error]'
	 });

      let error = test_error.createError();
      assert.ok(error instanceof Error, 'expected error to be an instance of Error');
      assert.strictEqual(error.message, 'error');

      error = test_error.createRangeError();
      assert.ok(error instanceof RangeError,
		'expected error to be an instance of RangeError');
      assert.strictEqual(error.message, 'range error');

      error = test_error.createTypeError();
      assert.ok(error instanceof TypeError,
		'expected error to be an instance of TypeError');
      assert.strictEqual(error.message, 'type error');

      error = test_error.createErrorCode();
      assert.ok(error instanceof Error, 'expected error to be an instance of Error');
      assert.strictEqual(error.code, 'ERR_TEST_CODE');
      assert.strictEqual(error.message, 'Error [error]');
      assert.strictEqual(error.name, 'Error');

      error = test_error.createRangeErrorCode();
      assert.ok(error instanceof RangeError,
		'expected error to be an instance of RangeError');
      assert.strictEqual(error.message, 'RangeError [range error]');
      assert.strictEqual(error.code, 'ERR_TEST_CODE');
      assert.strictEqual(error.name, 'RangeError');

      error = test_error.createTypeErrorCode();
      assert.ok(error instanceof TypeError,
		'expected error to be an instance of TypeError');
      assert.strictEqual(error.message, 'TypeError [type error]');
      assert.strictEqual(error.code, 'ERR_TEST_CODE');
      assert.strictEqual(error.name, 'TypeError');
      return res;
   }
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test(1000000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 100000;

main("test_number", N); 
