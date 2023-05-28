'use strict';

// Testing api calls for string
const test_string = require(`./build/Release/test_string`);
// Test passing NULL to object-related N-APIs.
const { testNull } = require(`./build/Release/test_string`);


let res = true;

const assert = {
   ok: v => res = res && v,
   throws: proc => { try { proc(); res = false; } catch(e) { ; } },
   strictEqual: (a, b) => { res = res && (a === b) || (Number.isNaN(a) && Number.isNaN(b)); },
   notStrictEqual: (a, b) => { res = res && (a !== b); },
   deepStrictEqual: (a, b) => { Object.keys(a).forEach(k => { res = res && (a[k] === b[k]); }) },
   notDeepStrictEqual: (a, b) => !assert.deepStrictEqual(a, b)
}

function run_null() {
   const expectedResult = {
      envIsNull: 'Invalid argument',
      stringIsNullNonZeroLength: 'Invalid argument',
      stringIsNullZeroLength: 'napi_ok',
      resultIsNull: 'Invalid argument',
   };
   assert.deepStrictEqual(expectedResult, testNull.test_create_latin1());
   assert.deepStrictEqual(expectedResult, testNull.test_create_utf8());
   assert.deepStrictEqual(expectedResult, testNull.test_create_utf16());
}

function run_string() {
   {
      const empty = '';
      assert.strictEqual(test_string.TestLatin1(empty), empty);
      assert.strictEqual(test_string.TestUtf8(empty), empty);
      assert.strictEqual(test_string.TestUtf16(empty), empty);
      assert.strictEqual(test_string.Utf16Length(empty), 0);
      assert.strictEqual(test_string.Utf8Length(empty), 0);

      const str1 = 'hello world';
      assert.strictEqual(test_string.TestLatin1(str1), str1);
      assert.strictEqual(test_string.TestUtf8(str1), str1);
      assert.strictEqual(test_string.TestUtf16(str1), str1);
      assert.strictEqual(test_string.TestLatin1Insufficient(str1), str1.slice(0, 3));
      assert.strictEqual(test_string.TestUtf8Insufficient(str1), str1.slice(0, 3));
      assert.strictEqual(test_string.TestUtf16Insufficient(str1), str1.slice(0, 3));
      assert.strictEqual(test_string.Utf16Length(str1), 11);
      assert.strictEqual(test_string.Utf8Length(str1), 11);

      const str2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      assert.strictEqual(test_string.TestLatin1(str2), str2);
      assert.strictEqual(test_string.TestUtf8(str2), str2);
      assert.strictEqual(test_string.TestUtf16(str2), str2);
      assert.strictEqual(test_string.TestLatin1Insufficient(str2), str2.slice(0, 3));
      assert.strictEqual(test_string.TestUtf8Insufficient(str2), str2.slice(0, 3));
      assert.strictEqual(test_string.TestUtf16Insufficient(str2), str2.slice(0, 3));
      assert.strictEqual(test_string.Utf16Length(str2), 62);
      assert.strictEqual(test_string.Utf8Length(str2), 62);

      const str3 = '?!@#$%^&*()_+-=[]{}/.,<>\'"\\';
      assert.strictEqual(test_string.TestLatin1(str3), str3);
      assert.strictEqual(test_string.TestUtf8(str3), str3);
      assert.strictEqual(test_string.TestUtf16(str3), str3);
      assert.strictEqual(test_string.TestLatin1Insufficient(str3), str3.slice(0, 3));
      assert.strictEqual(test_string.TestUtf8Insufficient(str3), str3.slice(0, 3));
      assert.strictEqual(test_string.TestUtf16Insufficient(str3), str3.slice(0, 3));
      assert.strictEqual(test_string.Utf16Length(str3), 27);
      assert.strictEqual(test_string.Utf8Length(str3), 27);

      const str4 = '¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿';
      assert.strictEqual(test_string.TestLatin1(str4), str4);
      assert.strictEqual(test_string.TestUtf8(str4), str4);
      assert.strictEqual(test_string.TestUtf16(str4), str4);
      assert.strictEqual(test_string.TestLatin1Insufficient(str4), str4.slice(0, 3));
      assert.strictEqual(test_string.TestUtf8Insufficient(str4), str4.slice(0, 1));
      assert.strictEqual(test_string.TestUtf16Insufficient(str4), str4.slice(0, 3));
      assert.strictEqual(test_string.Utf16Length(str4), 31);
      assert.strictEqual(test_string.Utf8Length(str4), 62);

      const str5 = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþ';
      assert.strictEqual(test_string.TestLatin1(str5), str5);
      assert.strictEqual(test_string.TestUtf8(str5), str5);
      assert.strictEqual(test_string.TestUtf16(str5), str5);
      assert.strictEqual(test_string.TestLatin1Insufficient(str5), str5.slice(0, 3));
      assert.strictEqual(test_string.TestUtf8Insufficient(str5), str5.slice(0, 1));
      assert.strictEqual(test_string.TestUtf16Insufficient(str5), str5.slice(0, 3));
      assert.strictEqual(test_string.Utf16Length(str5), 63);
      assert.strictEqual(test_string.Utf8Length(str5), 126);

      const str6 = '\u{2003}\u{2101}\u{2001}\u{202}\u{2011}';
      assert.strictEqual(test_string.TestUtf8(str6), str6);
      assert.strictEqual(test_string.TestUtf16(str6), str6);
      assert.strictEqual(test_string.TestUtf8Insufficient(str6), str6.slice(0, 1));
      assert.strictEqual(test_string.TestUtf16Insufficient(str6), str6.slice(0, 3));
      assert.strictEqual(test_string.Utf16Length(str6), 5);
      assert.strictEqual(test_string.Utf8Length(str6), 14);

/*       assert.throws(() => {                                         */
/* 	 test_string.TestLargeUtf8();                                  */
/*       }, /^Error: Invalid argument$/);                              */
/*                                                                     */
/*       assert.throws(() => {                                         */
/* 	 test_string.TestLargeLatin1();                                */
/*       }, /^Error: Invalid argument$/);                              */
/*                                                                     */
/*       assert.throws(() => {                                         */
/* 	 test_string.TestLargeUtf16();                                 */
/*       }, /^Error: Invalid argument$/);                              */
/*                                                                     */
/*       test_string.TestMemoryCorruption(' '.repeat(64 * 1024));      */
   }
}

function test(N) {
   res = true;

   for (let i = 0; i < N; i++) {
      run_string();
      run_null();
   }
   
   return res;
}

function main(bench, n) {
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
      test(100);
   }

   console.log("res=", res);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) : 6000;

main("test_string", N); 
