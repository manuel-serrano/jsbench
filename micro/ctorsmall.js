"use strict";

function CTOR( a, b ) {
   this.a = a;
   this.b = b;
}

function test( n ) {
   let k = n / 10;
   let m = 0;
   var r = 0;
   let j = 0;
   let l = arr.length;
   
   for( let i = 0; i < n; i++ ) {
      let III = i;
      if( III % k == 0 ) console.log( III );
      let OOO = new CTOR( III, n );
      if( ++j === l ) j = 0;
      arr[ j ] = OOO;
   }

   return m;
}

var p = {};
CTOR.prototype = { __proto__: { __proto__: { __proto__: p } } };

var o1 = new CTOR( 1, 2 );

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 70000000);

let arr = new Array( Math.min( N, 10000 ) );

console.log( "ctorsmall(", N, ")..." );

console.log( "test=", test( N ) );

let s = 0;
for( let i = arr.length - 1; i >= 0; i-- ) {
   s += ((arr[ i ].a > arr[ i ].b) ? 1 : -1);
}

console.log( "s=", s );

