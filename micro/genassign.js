"use hopscript";
"use strict";

function *iter( n ) {
   let a = yield n + 1;
   let b = yield n + 2;
   let c = yield n + 3;
   let d = yield n + 4;
   let e = yield n + 5;
   let f = yield n + 6;
   let g = yield n + 7;
   let h = yield n + 8;
   let i = yield n + 9;
   let j = yield n + 10;

   yield a + b + c + d + e + f + g + h + i + j;

   return ;
}


function test( n ) {
   let sum = 0;

   for( let i = 0; i < n; i++ ) {
      let g = iter( i );
      let m = 0;

      while( !(m = g.next( m.value ), m.done) ) {
	 sum += m.value;
      }
      if( i % 100000 == 0 ) console.log( "sum=", sum );
   }

   return sum;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 300000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000000);

console.log( "genassign(", N, ")..." );

console.log( test( N ) );
    
