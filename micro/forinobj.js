"use strict"

let k = 0;

// test for-in used with arrays
function foo( a, keys ) {
   let r = 0;
   for( let i = keys.length - 1; i >= 0; i-- ) {
      k++;
      r += a[ keys[ i ] ];
   }
   return r;
}

function myloop( n, a, b, ka, kb, acc ) {
   if( n > 0 ) {
      myloop( n - 1, a, b, ka, kb, acc + foo( a, ka ) - foo( b, kb ) );
   } else {
      return acc;
   }
}

function test( n ) { 
   let r = 0;
   const k = n / 10;
   const a = {b: 3, c: 4, a: 1, z: 10, w: -1};
   const b = {b4: 35, c3: 47, u: -19, t: -1};
   const ka = Object.keys( a );
   const kb = Object.keys( b );
   
   for( let i = 0; i < n; i++ ) {
      if( i % k === 0 ) console.log( i );
      r = myloop( 1000, a, b, ka, kb, 0 );
   }
   return r;
}
	
test( 50000 );
//console.log( "run=", t() );
   
