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

function loopDyn( n, a, b, ka, kb, acc ) {
   if( n > 0 ) {
      return loopDyn( n - 1, a, b, ka, kb, acc + dyn( a, ka ) - dyn( b, kb ) );
   } else {
      return acc;
   }
}

function loopSwt( n, a, b, ka, kb, acc ) {
   if( n > 0 ) {
      return loopSwt( n - 1, a, b, ka, kb, acc + swt( a, ka ) - swt( b, kb ) );
   } else {
      return acc;
   }
}

function test( n, loop ) { 
   let r = 0;
   const k = n / 10;
   const a = {b: 3, c: 4, a: 1, z: 10, w: -1};
   const b = {b: 35, c: 47, x: -19, z: -1};
   const ka = Object.keys( a );
   const kb = Object.keys( b );
   
   for( let i = 0; i < n; i++ ) {
      if( i % k === 0 ) console.log( i );
      r = loop( 1000, a, b, ka, kb, 0 );
   }
   return r;
}

test( 30000,  process.argv[ 2 ] === "dyn" ? loopDyn : loopSwt );
//console.log( "run=", t() );
   
