"use strict"

let k = 0;

// test for-in used with arrays
function dyn( a, keys ) {
   let r = 0;
   for( let i = keys.length - 1; i >= 0; i-- ) {
      k++;
      r += a[ keys[ i ] ];
   }
   return r;
}

function swt( a, keys ) {
   let r = 0;
   for( let i = keys.length - 1; i >= 0; i-- ) {
      k++;
      switch( keys[ i ] ) {
	 case "a": r += a.a; break;
	 case "b": r += a.b; break;
	 case "c": r += a.c; break;
	 case "z": r += a.z; break;
	 case "w": r += a.w; break;
	 case "x": r += a.x; break;
	 default: throw( "Illegal prop" );
      }
   }
   return r;
}

function myloop( n, fun, a, b, ka, kb, acc ) {
   if( n > 0 ) {
      myloop( n - 1, fun, a, b, ka, kb, acc + fun( a, ka ) - fun( b, kb ) );
   } else {
      return acc;
   }
}

function test( n, fun ) { 
   let r = 0;
   const k = n / 10;
   const a = {b: 3, c: 4, a: 1, z: 10, w: -1};
   const b = {b: 35, c: 47, x: -19, z: -1};
   const ka = Object.keys( a );
   const kb = Object.keys( b );
   
   for( let i = 0; i < n; i++ ) {
      if( i % k === 0 ) console.log( i );
      r = myloop( 1000, fun, a, b, ka, kb, 0 );
   }
   return r;
}

test( 30000,  process.argv[ 2 ] === "dyn" ? dyn : swt );
//console.log( "run=", t() );
   
