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
      return g[0].length;
   } else {
      return arguments.length;
   }
}

function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let m = 1, j = 0;
   
   const funs = new Array(k + 2);
   for (let i = 0; i <= k; i++) {
      funs[i] = test;
   }
   funs[k + 1] = 0; /* avoid too smaart analysis of funs */
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      const test = funs[j];
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

   console.log("res=", res + g.length);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 95000000: 95000000;

main("length", N); 
