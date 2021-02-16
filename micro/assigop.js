"use strict";

let o;

function SET( o, v ) {
   o.x += v;
}

function bar( n ) {
   o = { x: 0 };

   for( let i = 0; i < n; i++ ) {
      SET( o, i + 1 );
      SET( o, -i );
   }
   return o.x;
}

function foo( N ) {
   let k = N / 10;
   var R;
   
   for( let iii = 0; iii < N; iii++ ) {
      if( iii % k == 0 ) console.log( iii );
      R = bar( 40000 );
   }
   
   console.log( "R=", R );
   return R;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 1000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 80000);

console.log( "assigop(", N, ")..." );

console.log( foo( N ) );
