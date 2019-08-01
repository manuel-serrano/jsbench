"use strict"

// test for-in used with arrays
function foo( a ) {
   let r = 0;
   for( let i in a ) {
      r += a[ i ];
   }
   return r;
}

function t() { 
   let a = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
   let r;
   
   for( let i = 0; i < 4000000; i++ ) {
      r = foo( a );
   }
   
   return r;
}
	  
console.log( "run=", t() );
   
