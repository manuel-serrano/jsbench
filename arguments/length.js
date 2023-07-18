"use strict";

let g = new Array(5);

function test() {
   g[arguments.length] = arguments.length;
   if (arguments.length > 100) {
      console.log(g, "prevent", "nodejs");
      console.log("from", "inlining", "this", "function");
      console.log(g, "prevent", "nodejs");
      console.log("from", "inlining", "this", "function");
      console.log(g, "prevent", "nodejs");
      console.log("from", "inlining", "this", "function");
      g[0] = [ "prevent", "nodejs", "from", "inlining" ];
   }
   return arguments.length;
}

function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let i = 1;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (n % k === 0) { console.log( i++ ); }
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
      res |= test(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17);
   }

   console.log("res=", res);
}

const DEFAULT = 100000000;
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || DEFAULT: DEFAULT;

main("length", N); 
