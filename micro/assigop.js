"use strict";

function SET( o, v ) {
   o.x += v;
}

function bar( n ) {
   let o = { x : 0 };

   for( let i = 0; i < n; i++ ) {
      SET( o, i + 1 );
      SET( o, -i );
   }
   return o;
}

function foo( N ) {
   let k = N / 10;
   
   for( let iii = 0; iii < N; iii++ ) {
      if( iii % k == 0 ) console.log( iii );
      bar( iii );
   }
}

const N = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 80000;

console.log( foo( N ) );
