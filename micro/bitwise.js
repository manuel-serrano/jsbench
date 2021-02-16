"use strict";

function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

function bar( n ) {
   let r = 0;

   for( let i = 0; i < n; i++ ) {
      r = safe_add( i, n );
   }
   return r;
}

function foo( N ) {
   let k = N / 10;
   var R;
   
   for( let iii = 0; iii < N; iii++ ) {
      if( iii % k == 0 ) console.log( iii );
      R = bar( 80000 );
   }
   return R;
}

const K = 100;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000) * K);

console.log( "bitwise(", N, ")..." );

console.log( foo( N ) );
