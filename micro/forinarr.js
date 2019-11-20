"use strict"

// test for-in used with arrays
function foo( a ) {
   let r = 0;
   for( let i in a ) {
      r += a[ i ];
   }
   return r;
}

function t( N ) { 
   let a = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
   let r;
   
   for( let i = 0; i < N; i++ ) {
      r = foo( a );
   }
   
   return r;
}
	  
const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 4000000);

console.log( "forinarr(", N, ")..." );

console.log( "run=", t( N ) );
   
