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
   let a = new Array( 10000 );
   
   a.fill( 1, 0, 1000 );
   a.fill( -1, 1000, 5000 );
   a.fill( 1, 5000, 10000 );
   
   for( let i = 0; i < n; i++ ) {
      g = foo( a );
   }
   return g;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 100000);

console.log( "forofarr(", N, ")..." );

console.log( test( N ) );
