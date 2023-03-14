'use strict';

const test_array = require("./build/Release/test_array");

let res = true;

const assert = {
   ok: v => res &= v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res &= a === b },
   notStrictEqual: (a, b) => { res &= a !== b },
   deepStrictEqual: (a, b) => { a.forEach((e, i, a) => { res &= e === b[i] }) }
}

function test(N) {
   for (let i = 0; i < N; i++) {
      const array = [
	 1,
	 9,
	 48,
	 13493,
	 9459324,
	 { name: 'hello' },
	 [
	    'world',
	    'node',
	    'abi',
	 ],
      ];

      assert.throws(
	 () => {
	    test_array.TestGetElement(array, array.length + 1);
	 },
	 /^Error: assertion \(\(\(uint32_t\)index < length\)\) failed: Index out of bounds!$/
      );

      assert.throws(
	 () => {
	    test_array.TestGetElement(array, -2);
	 },
	 /^Error: assertion \(index >= 0\) failed: Invalid index\. Expects a positive integer\.$/
      );

      array.forEach(function(element, index) {
	 assert.strictEqual(test_array.TestGetElement(array, index), element);
      });


      assert.deepStrictEqual(test_array.New(array), array);

      assert.ok(test_array.TestHasElement(array, 0));
      assert.strictEqual(test_array.TestHasElement(array, array.length + 1), false);

      assert.ok(test_array.NewWithLength(0) instanceof Array);
      assert.ok(test_array.NewWithLength(1) instanceof Array);
      // Check max allowed length for an array 2^32 -1
      assert.ok(test_array.NewWithLength(4294967295) instanceof Array);

      {
	 // Verify that array elements can be deleted.
	 const arr = ['a', 'b', 'c', 'd'];

	 assert.strictEqual(arr.length, 4);
	 assert.strictEqual(2 in arr, true);
	 assert.strictEqual(test_array.TestDeleteElement(arr, 2), true);
	 assert.strictEqual(arr.length, 4);
	 assert.strictEqual(2 in arr, false);
      }
   }

   return res;
}

async function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      res = await test(30000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 15: 15;

main("test_array", N); 
