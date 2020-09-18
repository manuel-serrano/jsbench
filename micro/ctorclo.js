"use strict";

const fp = { name: "anonymous" };

function CTOR( a, b ) {
   let f = function( c ) {
      return a + b + c;
   }
   f.prototype = fp;
   return f;
}

function loop( arr, n, j ) {
   for( let i = 0; i < n; i++ ) {
      arr[ i ] = CTOR( j, n );
   }
}

function test( n ) {
   let k = n / 10;
   let arr = new Array( 1000 );
   
   for( let j = 0; j < 10; j++ ) {
      console.log( j );
      for( let i = 0; i < n; i++ ) {
	 loop( arr, arr.length, j );
      }
   }

   return arr.length;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 4000);

console.log( "ctorclo(", N, ")..." );

var arr = new Array( N );
console.log( "test=", test( N ) );
