"use strict";

// test forEach with arrays
function foo( a ) {
   let g = 0;
   for( let n of a ) {
      g += n;
   }
   return g;
}

function test( n ) {
   let g = 0;
   let a = [1, 2, 3];
   
   for( let i = 0; i < n; i++ ) {
      g = foo( a );
   }
   return g;
}

const N = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 100000000;

console.log( test( N ) );
