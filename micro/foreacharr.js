"use strict";

// test forEach with arrays
function foo( a ) {
   let g = 0;
   a.forEach( n => g += n );
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

const K = 100000;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1) * K);

console.log( "foreacharr(", N, ")..." );
console.log( test( N ) );
