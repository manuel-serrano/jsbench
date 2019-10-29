"use strict"

// test for-in used with arrays
function dyn( a, keys ) {
   let r = 0;
   for( let i = keys.length - 1; i >= 0; i-- ) {
      r += a[ keys[ i ] ];
   }
   return r;
}

function swt( a, keys ) {
   let r = 0;
   for( let i = keys.length - 1; i >= 0; i-- ) {
      const k = keys[ i ];
      
      switch( k ) {
	 case "a": r += a.a; break;
	 case "b": r += a.b; break;
	 case "c": r += a.c; break;
	 case "d": r += a.d; break;
	 case "e": r += a.e; break;
	 case "f": r += a.f; break;
	 case "g": r += a.g; break;
	 case "h": r += a.h; break;
	 case "i": r += a.i; break;
	 case "j": r += a.j; break;
	 case "k": r += a.k; break;
	 case "l": r += a.l; break;
 	 case "m": r += a.m; break;
  	 case "n": r += a.n; break;
 	 case "o": r += a.o; break;
	 case "p": r += a.p; break;
	 case "q": r += a.q; break;
	 case "r": r += a.r; break;
	 case "s": r += a.s; break;
	 case "t": r += a.t; break;
	 case "u": r += a.u; break;
	 case "v": r += a.v; break;
	 case "w": r += a.w; break;
	 case "x": r += a.x; break;
	 case "y": r += a.y; break;
	 case "z": r += a.z; break;
	 default: throw( "Illegal prop" );
      }
   }
   return r;
}

function loopDyn( n, a, b, ka, kb, acc ) {
   if( n > 0 ) {
      a[ ka[ 0 ] ] = b[ kb[ 0 ] ];
      return loopDyn( n - 1, a, b, ka, kb, acc + dyn( a, ka ) + dyn( b, kb ) );
   } else {
      return acc;
   }
}

function loopSwt( n, a, b, ka, kb, acc ) {
   if( n > 0 ) {
      return loopSwt( n - 1, b, a, kb, ka, acc + swt( a, ka ) + swt( b, kb ) );
   } else {
      return acc;
   }
}

function test( n, name ) { 
   console.log( "testing", name );
   let r = 0;
   let v = 1;
   const k = n / 10;
   const ka = "abcdefghijkl";
   const kb = "jklmnopqrstuvwxyz"
   const a = {};
   const b = {};
   
   for( let i = 0; i < ka.length; i++ ) {
      a[ ka.charAt( i ) ] = v;
      v = -v;
   }
   
   for( let i = 0; i < kb.length; i++ ) {
      b[ kb.charAt( i ) ] = v;
      v = -v;
   }
   
   const na = Object.keys( a );
   const nb = Object.keys( b );
   
   for( let i = 0; i < n; i++ ) {
      if( i % k === 0 ) console.log( i );
      if( name === "dyn" ) {
      	 r += loopDyn( 1000, a, b, na, nb, 0 );
      } else {
      	 r += loopSwt( 1000, a, b, na, nb, 0 );
      }
   }
   return r;
}

const N = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 30000;

console.log( "r=", test( N,  process.argv[ 3 ] || "switch" ) );
//console.log( "run=", t() );
   
