'use strict';

const test_function = require(`./build/Release/test_function`);

let res = true;

const assert = {
   ok: v => res = res && v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b) || (Number.isNaN(a) && Number.isNaN(b)); },
   notStrictEqual: (a, b) => { res = res && (a !== b); },
   deepStrictEqual: (a, b) => { Object.keys(a).forEach(k => { res = res && (a[k] === b[k]); }) },
   notDeepStrictEqual: (a, b) => !assert.deepStrictEqual(a, b)
}

function func1() {
  return 1;
}

function func2() {
   // console.log('hello world!');
  return null;
}

function func3(input) {
  return input + 1;
}

function func4(input) {
  return func3(input);
}

function test(N) {
   res = true;

   for (let i = 0; i < N; i++) {
      assert.strictEqual(test_function.TestCall(func1), 1);
      assert.strictEqual(test_function.TestCall(func2), null);
      assert.strictEqual(test_function.TestCall(func3, 1), 2);
      assert.strictEqual(test_function.TestCall(func4, 1), 2);

      assert.strictEqual(test_function.TestName.name, 'Name');
      assert.strictEqual(test_function.TestNameShort.name, 'Name_');

      assert.deepStrictEqual(test_function.TestCreateFunctionParameters(), {
	 envIsNull: 'Invalid argument',
	 nameIsNull: 'napi_ok',
	 cbIsNull: 'Invalid argument',
	 resultIsNull: 'Invalid argument'
      });

      assert.throws(
	 () => test_function.TestBadReturnExceptionPending(),
	 {
	    code: 'throwing exception',
	    name: 'Error'
	 }
      );
   }
   
   return res;
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test(1000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 700;

main("test_function", N); 
