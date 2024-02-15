"use strict";

let o;

function SWAP( o1, o2 ) {
   let x = o1.x;
   o1.x = o2.y;
   o2.y = x;
   
   return o;
}

function bar( n, a, i ) {
   let v = 0, w = 0;
   const k = a.length - 1;
   let o1 = { x: 23, y: "55" }, o2 = { x:76, y: 12 };
   a[ i ] = o1;
   a[ i + 1 ] = o2;
   
   for( let i = 0; i < n; i++ ) {
      for( let j = 1; j < k; j++ ) {
	 SWAP( o1, o2 );
      }
   }
   return a;
}

function foo( N ) {
   let k = N / 10;
   let R;
   let a = new Array( 11 );
   
   for( let i = 0; i < 11; i++ ) {
      a[ i ] = 0;
   }

   a[ 0 ] = "23";
   a[ 9 ] = true;
   a[ 10 ] = undefined;
   
   for( let iii = 0; iii < N; iii++ ) {
      if( iii % k == 0 ) console.log( iii );
      for( let l = 0; l < 10; l++ ) {
      	 R = bar( 400, a, l );
      }
   }
   
   console.log( "A=", a );
   return R[ 0 ].x + R[ 1 ].y;
}

const K = 60;
const N = (process.argv[ 1 ] === "fprofile") 
      ? K / 10
      : ((process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000) * K);

console.log( "swap(", N, ")..." );

console.log( foo( N ) );
