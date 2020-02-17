"use strict";
"use hopscript";

function build( num ) {
   var s = "aaabbb" + num;

   for( var i = 0; i < num; i++ ) {
      s += "right";
      s += "a";
      s += (1 + "b" + 2);
   }

   return s;
}

function str( num ) {
   var res = 0;
   var j = 0;
   var l = 0;

   for( var i = 0; i < num; i++ ) {
      var s = build( 5000 );
      if( i % 1000 == 0 ) console.log( "i=" + i );

      res = s.length + 1;
   }

   return res;
}

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 30000);

console.log( "strleft(", N, ")..." );

console.log( "len=" + str( N ) );

