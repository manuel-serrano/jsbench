'use strict';

const test_date = require(`./build/Release/test_date`);

let res = true;

const assert = {
   ok: v => res = res && v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b) || (Number.isNaN(a) && Number.isNaN(b)); },
   notStrictEqual: (a, b) => { res = res && (a !== b); },
   deepStrictEqual: (a, b) => { Object.keys(a).forEach(k => { res = res && (a[k] === b[k]); }) },
   notDeepStrictEqual: (a, b) => !assert.deepStrictEqual(a, b)
}

function test(N) {
   res = true;

   for (let i = 0; i < N; i++) {
      const dateTypeTestDate = test_date.createDate(1549183351);
      assert.strictEqual(test_date.isDate(dateTypeTestDate), true);

      assert.strictEqual(test_date.isDate(new Date(1549183351)), true);

      assert.strictEqual(test_date.isDate(2.4), false);
      assert.strictEqual(test_date.isDate('not a date'), false);
      assert.strictEqual(test_date.isDate(undefined), false);
      assert.strictEqual(test_date.isDate(null), false);
      assert.strictEqual(test_date.isDate({}), false);

      assert.strictEqual(test_date.getDateValue(new Date(1549183351)), 1549183351);
   }
   
   return res;
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test(10000);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 2000;

main("test_date", N); 
