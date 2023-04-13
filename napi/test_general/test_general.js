'use strict';

const test_general = require(`./build/Release/test_general`);

let res = true;

const assert = {
   ok: v => res = res && v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b) || (Number.isNaN(a) && Number.isNaN(b)); },
   notStrictEqual: (a, b) => { res = res && (a !== b); },
   deepStrictEqual: (a, b) => { Object.keys(a).forEach(k => { res = res && (a[k] === b[k]); }) },
   notDeepStrictEqual: (a, b) => !assert.deepStrictEqual(a, b)
}

const val1 = '1';
const val2 = 1;
const val3 = 1;

class BaseClass {
}

class ExtendedClass extends BaseClass {
}

const baseObject = new BaseClass();
const extendedObject = new ExtendedClass();

function test(N) {
   res = true;

   for (let i = 0; i < N; i++) {
      // Test napi_strict_equals
      assert.ok(test_general.testStrictEquals(val1, val1));

      assert.strictEqual(test_general.testStrictEquals(val1, val2), false);
      assert.ok(test_general.testStrictEquals(val2, val3));
      // Test napi_get_prototype
      assert.strictEqual(test_general.testGetPrototype(baseObject),
			 Object.getPrototypeOf(baseObject));
      assert.strictEqual(test_general.testGetPrototype(extendedObject),
			 Object.getPrototypeOf(extendedObject));
      // Prototypes for base and extended should be different.
      assert.notStrictEqual(test_general.testGetPrototype(baseObject),
			    test_general.testGetPrototype(extendedObject));
      // Test version management functions
      assert.strictEqual(test_general.testGetVersion(), 8);

      [
	 123,
	 'test string',
	 function() {},
	 new Object(),
	 true,
	 undefined,
	 Symbol(),
      ].forEach((val) => {
	 assert.strictEqual(test_general.testNapiTypeof(val), typeof val);
      });

      // Since typeof in js return object need to validate specific case
      // for null
      assert.strictEqual(test_general.testNapiTypeof(null), 'null');

      // Assert that wrapping twice fails.
      const x = {};
      test_general.wrap(x);
      assert.throws(() => test_general.wrap(x),
		    { name: 'Error', message: 'Invalid argument' });
      // Clean up here, otherwise derefItemWasCalled() will be polluted.
      test_general.removeWrap(x);

      // Ensure that wrapping, removing the wrap, and then wrapping again works.
      const y = {};
      test_general.wrap(y);
      test_general.removeWrap(y);
      // Wrapping twice succeeds if a remove_wrap() separates the instances
      test_general.wrap(y);
      // Clean up here, otherwise derefItemWasCalled() will be polluted.
      test_general.removeWrap(y);

      // Test napi_adjust_external_memory
      const adjustedValue = test_general.testAdjustExternalMemory();
      assert.strictEqual(typeof adjustedValue, 'number');
      assert.ok(adjustedValue > 0);

   }
   
   return res;
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test(500);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 2000;

main("test_general", N); 
