"use strict";

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
      bar( 150000 );
   }
}

console.log( bar( 1 ) );

const N = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 20000;

console.log( foo( N ) );
