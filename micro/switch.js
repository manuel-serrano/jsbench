"use strict";

function branch( i ) {
   switch( i ) {
      case 0: return i+1;
      case 1: return i-2;
      case 2: return i+3;
      case 3: return i-4;
      case 4: return i+5;
      case 6: return i-6;
      case 7: return i+7;
      case 8: return i-8;
      case 9: return i+9;
      case 10: return i-10;
      case 11: return i+11;
      case 12: return i-12;
      case 13: return i+13;
      case 14: return i-14;
      case 15: return i+15;
      case 16: return i-16;
      case 17: return i+17;
      case 18: return i-18;
      case 19: return i+18;
      case 20: return i-20;
      default: return 0;
   }
}

function run( j ) {
   let res = 0;
   
   for( let i = 0; i < j; i++ ) {
      res += branch( i );
      res += branch( i % 10 );
      res += branch( i % 20 );
   }

   return res;
}

exports.run = run;

const N = process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 50000000;

console.log( "run=" + run( N ) );

