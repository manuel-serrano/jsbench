"use strict";
"use hopscript";

function Ctor1() {
   this.ctor1 = 1;
}

function Ctor2() {
   this.ctor2 = 2;
}

function Ctor3() {
   this.ctor3 = 3;
}
Ctor3.prototype = new Ctor1();

let ddd = 0;

function testIn( obj, key ) {
   if( key.x in obj ) ddd++;
   if( key.y in obj ) ddd++;
   if( key.z in obj ) ddd++;
}

function gee( CNT ) {
   ddd = 0;
   
   let obj1 = new Ctor1();
   let obj2 = new Ctor2();
   let obj3 = new Ctor3();
   
   let key1 = { x: "ctor1", y: "ctor2", z: "ctor3" };
   let key2 = { x: "ctor3", y: "ctor1", z: "ctor2" };
   let key3 = { x: "ctor2", y: "ctor3", z: "ctor1" };
   
   const N = CNT / 10;
   let cnt = 0;
   
   for( let jjj = 0, iii = 0; jjj < CNT; jjj++ ) {
      if( iii === N ) {
	 cnt += N
	 console.log( cnt );
	 iii = 0;
      } else {
	 iii++;
      }
      
      for( let iii = 0; iii < 80000; iii++ ) {
	 testIn( obj1, key1 );
	 testIn( obj1, key2 );
	 testIn( obj1, key3 );
	 testIn( obj2, key1 );
	 testIn( obj2, key2 );
	 testIn( obj3, key3 );
	 testIn( obj3, key1 );
	 testIn( obj3, key2 );
	 testIn( obj3, key3 );
      }
   }

   return ddd;
}

exports.run = gee;

const N = (process.argv[ 1 ] === "fprofile") 
      ? 200
      : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 200);

console.log( "indyn(", N, ")..." );
console.log( gee( N ) );
