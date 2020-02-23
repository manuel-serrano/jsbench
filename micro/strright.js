"use strict";
"use hopscript";

function build( num, j ) {
   var s = "aaabbb" + num;

   for( var i = 0; i < num; i++ ) {
      s = "right" + s;
      s = j + s;
      s = ("b" + j) + s;
   }

   return s;
}

function str( num ) {
   var j = 0;
   var l = 0;
   const k = Math.round( num / 10 );
   var res = new Array( k );;
   
   for( var j = 0; j < 10; j++ ) {
      for( var i = 0; i < k; i++ ) {
      	 var s = build( 5000, j );

      	 res[ j ] = s.length + 1;
      }
      console.log( "j=" + j );
   }

   return res;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 5000);

console.log( "strright(", N, ")..." );

console.log( "len=" + str( N ) );

