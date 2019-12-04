"use strict";

function fib(i) {
   if( i < 2 ) {
      return 1;
   } else {
      return fib( i - 1 ) + fib( i - 2 );
   }
}

function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      res = fib( 42 );
   }

   console.log( "res=", res );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 1
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 5;

main( "fib", N ); 

