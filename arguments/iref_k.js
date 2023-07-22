"use strict";

function test() {
   let res = 0;
   for (let l = arguments.length, i = 0; i < l; i++) {
      res += arguments[i];
   }
   if (res < 0) {
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      return 0;
   } 

   if (arguments.length === 1000) {
      return arguments[1001];
   }
   
   return res;
}

function id() {
   return 0;
}

function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let m = 1, j = 0;
   
   const funs = new Array(k + 1);
   for (let i = 0; i <= k; i++) {
      funs[i] = test;
   }
   funs[k] = id; /* prevent function inlining */
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (j === k) { console.log( m++ ); j = 0; } else { j++; }
      const test = funs[j];
      res = test();
      res += test(102938080988);
      res += test(1, 2);
      res += test(1, 2, 3);
      res += test(1, 2, 3, 4);
      res += test(1, 2, 3, 4, 5);
      res += test(1, 2, 3, 4, 5, 6);
      res += test(1, 2, 3, 4, 5, 6, 7);
      res += test(1, 2, 3, 4, 5, 6, 7, 8);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      res += test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17);
   }

   console.log("res=", res);
}

const DEFAULT = 12000000;
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || DEFAULT : DEFAULT;

main("aref", N); 
