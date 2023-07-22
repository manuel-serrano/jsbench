"use strict";

let g = new Array(5);

function test(a, b, c, d, e) {
   switch (arguments.length) {
      case 0: a = 34, b = 1, c = 3, d = 4, e = 5; break;
      case 1: b = a, c = 2, d = 43, e = 53; break;
      case 2: c = a, d = b, e = 353; break;
      case 3: d = a, e = b; break;
      case 4: e = a; break;
   }
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
      return a;
   }
}

function id() {
   return 0;
}

function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let m = 1, j = 0;
   
   const funs = new Array(k + 1);
   for (let i = 0; i < k; i++) {
      funs[i] = test;
   }
   funs[k] = id; /* prevent function inlining */
   
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
   }

   console.log("res=", res + g.length);
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || 95000000: 95000000;

main("length", N); 
