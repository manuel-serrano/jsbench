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
 
function buildObjects() {
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

function run( count ) {
   const os = buildObjects();
   const rem = tabulateRemainder( count, os.length );
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
const K = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000;
const N = parseInt( process.argv[ 4 ] || "1" );

console.log( "proxy...", K );

console.log( run( K ) );
