"use strict";

function branch( s, i ) {
   switch( s.charAt( i ) ) {
      case 'a': return i+1;
      case 'b': return i-2;
      case 'c': return i+3;
      case 'd': return i-4;
      case 'e': return i+5;
      case 'f': return i-6;
      case 'g': return i+7;
      case 'h': return i-8;
      case 'i': return i+9;
      case 'j': return i-10;
      case 'k': return i+11;
      case 'l': return i-12;
      case 'm': return i+13;
      case 'n': return i-14;
      case 'o': return i+15;
      case 'p': return i-16;
      case 'q': return i+17;
      case 'r': return i-18;
      case 's': return i+18;
      case 't': return i-20;
      default: return 0;
   }
}

function run( j ) {
   let res = 0;
   const s1 = "abcdefghijklmnopqrstuvwxyz";
   const s2 = "bcdefghijklmnopqrstuvwxyza";
   const s3 = "cdefghijklmnopqrstuvwxyzab";
   
   for( let i = 0; i < j; i++ ) {
      res += branch( s1, i );
      res += branch( s2, i % 10 );
      res += branch( s3, i % 20 );
   }

   return res;
}

exports.run = run;

const N = (process.argv[ 1 ] === "fprofile") 
      ? 10000
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 50000000);

console.log( "switch(", N, ")..." );
console.log( "run=" + run( N ) );

