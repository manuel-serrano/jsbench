"use strict";

function readX( obj ) {
   return obj.x;
}

function tabulateRemainder( count, mask ) {
   let r = new Array( count );
   for(let i = count -1; i >= 0; i-- ) {
      r[ i ] = i % mask;
   }
   return r;
}
 
function buildObjects( test, N ) {
   if( test === "mono" ) {
      return [ { x: 21, y: 1 },
	       { x: 21, y: 2 },
	       { x: 21, y: 3 },
	       { x: 21, y: 4 },
	       { x: 21, y: 5 },
	       { x: 21, y: 6 },
	       { x: 21, y: 7 },
	       { x: 21, y: 8 },
	       { x: 21, y: 9 },
	       { x: 21, y: 10 },
	       { x: 21, y: 11 },
	       { x: 21, y: 12 },
	       { x: 21, y: 12 },
	       { x: 21, y: 13 },
	       { x: 21, y: 14 },
	       { x: 21, y: 15 },
	       { x: 21, y: 16 } ];
   }

   if( test === "poly" ) {
      return [ { x: 21, y: 1 },
	       { a: 21, x: 55, y: 2 },
	       { b: 2, a: 56, y: 3, x: 12 },
	       { x: 3, c: 34, y: 4 },
	       { d: 4, r: 54, u: 78, y: 5, x: 12 },
	       { e: 5, x: 55, y: 6 },
	       { f: 6, x: 34, y: 7 },
	       { g: 8, y: 55, x: 12 },
	       { z: 0, x: 21, y: 9 },
	       { z: 1, a: 21, x: 55, y: 10 },
	       { z: 3, b: 2, a: 56, y: 11, x: 12 },
	       { z: 4, x: 3, c: 34, y: 12 },
	       { z: 2, d: 4, r: 54, u: 78, y: 13, x: 12 },
	       { z: 34, e: 5, x: 55, y: 14 },
	       { z: 44, f: 6, x: 34, y: 15 },
	       { z: 46, g: 8, y: 16, x: 12 } ];
   }
   
   if( test === "miss" ) {
      return [ { xx: 21, y: 1 },
	       { xx: 21, y: 2 },
	       { xx: 21, y: 3 },
	       { xx: 21, y: 4 },
	       { xx: 21, y: 5 },
	       { xx: 21, y: 6 },
	       { xx: 21, y: 7 },
	       { xx: 21, y: 8 },
	       { xx: 21, y: 9 },
	       { xx: 21, y: 10 },
	       { xx: 21, y: 11 },
	       { xx: 21, y: 12 },
	       { xx: 21, y: 12 },
	       { xx: 21, y: 13 },
	       { xx: 21, y: 14 },
	       { xx: 21, y: 15 },
	       { xx: 21, y: 16 } ];
   }
   
   if( test === "proto" ) {
      const arr = new Array( N );
      let proto = { a: 1, b: 3, x: 12345, d: 3 };
      
      for( let i = 0; i < N; i++ ) {
	 proto = { __proto__: proto, z: i };
      }
	 
      for( let i = 0; i < N; i++ ) {
	 arr[ i ] = { __proto__: proto, yyyy: i };
      }
      return arr;
   }
   
   if( test === "prop-mono" ) {
      return [ { get x() { return 1; }, y: 1 },
	       { get x() { return 2; }, y: 2 },
	       { get x() { return 3; }, y: 3 },
	       { get x() { return 4; }, y: 4 },
	       { get x() { return 5; }, y: 5 },
	       { get x() { return 6; }, y: 6 },
	       { get x() { return 7; }, y: 7 },
	       { get x() { return 8; }, y: 8 },
	       { get x() { return 1; }, y: 9 },
	       { get x() { return 2; }, y: 10 },
	       { get x() { return 3; }, y: 11 },
	       { get x() { return 4; }, y: 12 },
	       { get x() { return 5; }, y: 13 },
	       { get x() { return 6; }, y: 14 },
	       { get x() { return 7; }, y: 15 },
	       { get x() { return 8; }, y: 16 } ];
   }

   if( test === "prop-poly" ) {
      return [ { a: 1, get x() { return 1}, y: 1 },
	       { a: 1, b: 3, get x() { return 2; }, y: 2 },
	       { get x() { return 3; }, y: 3 },
	       { y: 4, z: 4, u: 3, get x() { return 4; } },
	       { t: 1, get x() { return 5; }, y: 5 },
	       { a: 1, n: 3, r: 3, get x() { return 6; }, y: 6 },
	       { a: 1, n: 3, r: 3, u:3, get x() { return 7; }, y: 7 },
	       { a: 1, n: 3, r: 3, u:3, v: 4, get x() { return 8; } },
	       { a: 1, n: 3, r: 3, u:3, v: 4, get x() { return 9; }, y: 9 },
	       { a: 1, n: 3, r: 3, get x() { return 10; }, z: 9 },
	       { get x() { return 11; }, z: 9, a: 10 },
	       { get x() { return 12; }, a: 10, b: 13 },
	       { p: 3, m: 3, get x() { return 13; }, a: 10, b: 13 },
	       { q: 3, get x() { return 14; }, b: 13 },
	       { d: 3, e: 8, get x() { return 14; }, i: 13, j: 45 },
	       { d: 3, get x() { return 15; }, i: 13, j: 45 },
	       { z: 54, u: 34, v: 34, w: 34, get x() { return 16; }, t: 0 }
	     ];
   }

   if( test === "proxy" ) {
      const base = { x: 21, y: 1 };
      const hdl = { get: function( obj, prop ) {
		       return obj[ prop ];
		    }
      };
      const hdl2 = { get: function( obj, prop ) {
		       return obj[ prop ];
		    }
      };
      const hdl3 = { get: function( obj, prop ) {
		       return obj[ prop ];
		    }
      };
      const hdl4 = { get: function( obj, prop ) {
		       return obj[ prop ];
		    }
      };
      const obj = new Proxy( base, hdl );
      const obj2 = new Proxy( base, hdl2 );
      const obj3 = new Proxy( base, hdl3 );
      const obj4 = new Proxy( base, hdl4 );

      return [ obj, obj2, obj3, obj4,
	       obj, obj2, obj3, obj4,
	       obj, obj2, obj3, obj4,
	       obj, obj2, obj3, obj4 ];
   }

   throw TypeError( "Unknown test " + test );
}

function run( count, TEST, N ) {
   const rem = tabulateRemainder( count, N );
   const os = buildObjects( TEST, N );
   let s = 0;

   for( let j = 0; j < count; j++ ) {
      if( j % 1000 === 0 ) console.log( j );
      for( let i = 0; i < count; i++ ) {
	 let o = os[ rem[ i ] ];
	 s = readX( o );
      }
   }

   return s;
}

/* example: nodejs cache.js mono 1 */
/* const process = { argv: ["nodejs", "cache.js", "proxy", "1" ] };    */
/* const console = { log: print };                                     */
const TEST = process.argv[ 2 ] || "mono";
const N = parseInt( process.argv[ 3 ] || "1" );

console.log( "testing...", TEST, N );

console.log( run( 10000, TEST, N ) );
