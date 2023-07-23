"use strict";

// don't change the layout of the function
function test() {
   let res = 0;
   for (let l = arguments.length, i = 0; i < l; i++) {
      res |= arguments[i];
   }
   if (res === 4) {
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      console.log("do", "not", "inline", "this", "function");
      return 0;
   }

   // out of range access to force an iref compilation
   if (arguments.length === 1000) {
      return arguments[1001];
   }
   
   return res;
}

function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let m = 1, j = 0;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (j === k) { console.log( m++ ); j = 0; } else { j++; }
      res = test();
      res |= test(102938080988);
      res |= test(1, 2);
      res |= test(1, 2, 3);
      res |= test(1, 2, 3, 4);
      res |= test(1, 2, 3, 4, 5);
      res |= test(1, 2, 3, 4, 5, 6);
      res |= test(1, 2, 3, 4, 5, 6, 7);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
   }

   console.log("res=", res, "/", -141134113);
}

const DEFAULT = 30000000;
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || DEFAULT : DEFAULT;

main("iref", N); 
