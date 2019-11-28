"use strict";

function SETx( o ) {
   o.x = o.y;
}

function SETy( o ) {
   o.y = o.x;
}

function bar( n ) {
   let o = { x : 0, y: 1 };

   for( let i = 0; i < n; i++ ) {
      SETx( o );
      SETy( o );
   }
   return o;
}

function foo( N ) {
   let k = N / 10;
   
   for( let iii = 0; iii < N; iii++ ) {
      if( iii % k == 0 ) console.log( iii );
      bar( 40000 );
   }
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 1000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 80000);

console.log( "assigop(", N, ")..." );

console.log( foo( N ) );
