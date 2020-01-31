"use strict";

var g;

function SET1( o ) {
   o.x++;
}

function SET2( o ) {
   o.x--;
}

function bar( n ) {
   let o = { x : 0 };

   for( let i = 0; i < n; i++ ) {
      SET1( o );
      SET2( o );
   }
   return o;
}

function foo( N ) {
   let k = N / 10;
   
   for( let i = 0; i < N; i++ ) {
      if( i % k == 0 ) console.log( i );
      g = bar( 150000 );
   }
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 1000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 20000);

console.log( "incop(" + N + "):", bar( 1 ) );

foo( N );
