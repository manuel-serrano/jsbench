"use strict";

let M = 0;
let G = 0;

function fun( i ) {
   G++;
   return this.x;
}

const proto = { f: fun };

function gee( CNT, m ) {
   M = m;
   let s = 0;
   let os = [ { x: 12345, y : 2, __proto__: proto },
	      { a: 0, x: -12345, y: 2, __proto__: proto }
	    ];
   
   for( let j = 0; j < CNT; j++ ) {
      G = 0;
      if( j % 1000 == 0 ) console.log( j );
      for( let i = 0; i < 300000; i++ ) {
         let o = os[ i % M ];
         s = o.f( i );
      }
   }

   return G + s;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 100 
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 10000);

console.log( gee( N, 1 ) + " (=22344)" );
