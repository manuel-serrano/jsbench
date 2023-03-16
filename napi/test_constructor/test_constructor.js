'use strict';

const TestConstructor = require(`./build/Release/test_constructor`);

const getterOnlyErrorRE =
  /^TypeError: Cannot set property .* of #<.*> which has only a getter$/;

let res = true;

const assert = {
   ok: v => res &= v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b); },
   notStrictEqual: (a, b) => { res = res && (a !== b); },
   deepStrictEqual: (a, b) => { Object.keys(a).forEach(k => { res = res && (a[k] === b[k]); }) }
}

function test1() {
   const test_object = new TestConstructor();

   assert.strictEqual(test_object.echo('hello'), 'hello');

   test_object.readwriteValue = 1;
   assert.strictEqual(test_object.readwriteValue, 1);
   test_object.readwriteValue = 2;
   assert.strictEqual(test_object.readwriteValue, 2);

   assert.throws(() => { test_object.readonlyValue = 3; },
		 /^TypeError: Cannot assign to read only property 'readonlyValue' of object '#<MyObject>'$/);

   assert.ok(test_object.hiddenValue);

   // Properties with napi_enumerable attribute should be enumerable.
   const propertyNames = [];
   for (const name in test_object) {
      propertyNames.push(name);
   }
   assert.ok(propertyNames.includes('echo'));
   assert.ok(propertyNames.includes('readwriteValue'));
   assert.ok(propertyNames.includes('readonlyValue'));
   assert.ok(!propertyNames.includes('hiddenValue'));
   assert.ok(!propertyNames.includes('readwriteAccessor1'));
   assert.ok(!propertyNames.includes('readwriteAccessor2'));
   assert.ok(!propertyNames.includes('readonlyAccessor1'));
   assert.ok(!propertyNames.includes('readonlyAccessor2'));

   // The napi_writable attribute should be ignored for accessors.
   test_object.readwriteAccessor1 = 1;
   assert.strictEqual(test_object.readwriteAccessor1, 1);
   assert.strictEqual(test_object.readonlyAccessor1, 1);
   assert.throws(() => { test_object.readonlyAccessor1 = 3; }, getterOnlyErrorRE);
   test_object.readwriteAccessor2 = 2;
   assert.strictEqual(test_object.readwriteAccessor2, 2);
   assert.strictEqual(test_object.readonlyAccessor2, 2);
   assert.throws(() => { test_object.readonlyAccessor2 = 3; }, getterOnlyErrorRE);

   // Validate that static properties are on the class as opposed
   // to the instance
   assert.strictEqual(TestConstructor.staticReadonlyAccessor1, 10);
   assert.strictEqual(test_object.staticReadonlyAccessor1, undefined);

   // Verify that passing NULL to napi_define_class() results in the correct
   // error.
   assert.deepStrictEqual(TestConstructor.TestDefineClass(), {
      envIsNull: 'Invalid argument',
      nameIsNull: 'Invalid argument',
      cbIsNull: 'Invalid argument',
      cbDataIsNull: 'napi_ok',
      propertiesIsNull: 'Invalid argument',
      resultIsNull: 'Invalid argument'
   });
}

function test2() {
   assert.strictEqual(TestConstructor.name, 'MyObject');
}

function test(N) {
   res = true;

   for (let i = 0; i < N; i++) {
      test1();
      test2();
   }
   
   return res;
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test(3000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 100;

main("test_array", N); 
