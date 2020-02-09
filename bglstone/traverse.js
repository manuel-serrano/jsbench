"use strict";

var LIMIT = 2000;

var S = 0;

function pair( car, cdr ) {
   this.car = car;
   this.cdr = cdr;
}

function cons( car, cdr ) {
   return new pair( car, cdr );
}

function list( ...els ) {
   function loop( v, i ) {
      if( i === v.length ) {
	 return nil;
      } else {
	 return cons( v[ i ], loop( v, i + 1 ) );
      }
   }
   
   return loop( els, 0 );
}   

function car( p ) { return p.car; }
function cdr( p ) { return p.cdr; }
function cadr( p ) { return p.cdr.car; }
function cdar( p ) { return p.car.cdr; }
function caar( p ) { return p.car.car; }
function cddr( p ) { return p.cdr.cdr; }
function caddr( p ) { return p.cdr.cdr.car; }
function cdddr( p ) { return p.cdr.cdr.cdr; }
function cadddr( p ) { return p.cdr.cdr.cdr.car; }
function cddddr( p ) { return p.cdr.cdr.cdr.cdr; }

function setCar( p, v ) { return p.car = v; }
function setCdr( p, v ) { return p.cdr = v; }

const nil = null;

function nullp( o ) { return o === null; }
function pairp( o ) { return o instanceof pair; }

let SN = 0;
let RAND = 21;
let COUNT = 0;
let MARKER = false;
let ROOT = null;

function reset () {
   SN = 0;
   COUNT = 0;
   MARKER = false;
   ROOT = null;
}

function snd() {
   return ++SN;
}

function seed() {
   return RAND = 21;
}

function Node() {
   this.parents = null;
   this.sons = null;
   this.sn = snd();
   this.entry1 = false;
   this.entry2 = false;
   this.entry3 = false;
   this.entry4 = false;
   this.entry5 = false;
   this.entry6 = false;
   this.entry8 = false;
   this.mark = false;
}

function traverseRandom() {
   RAND = (RAND * 17) % 251;
   return RAND;
}

function traverseRemove( n, q ) {
   if( cdar( q ) === car( q ) ) {
      let x = caar( q );
      setCar( q, null );
      return x;
   } else if( n === 0 ) {
      let x = caar( q );
      let p = car( q );
      let m = 0;
      
      while( cdr( p ) !== car( q ) ) {
      	 p = cdr( p );
      }
      setCdr( p, cdar( q ) );
      setCar( q, p );
      return x;
   } else {
      let p = cdar( q );
      q = car( q );
      while( n > 0 ) {
	 n--;
	 q = cdr( q );
	 p = cdr( p );
      }
      let x = car( q );
      setCdr( q, p );
      return x;
   }
}

function traverseSelect( n, q ) {
   q = car( q );
   let i = 0;
   while( n > 0 ) {
      n--;
      q = cdr( q );
      i++;
   }
   return car( q );
}

function add( a, q ) {
   if( nullp( q ) ) {
      let x = list( a );
      setCdr( x, x );
      return list( x );
   } else if( nullp( car( q ) ) ) {
      let x = list( a );
      setCdr( x, x );
      setCar( q, x );
      return q;
   } else {
     setCdr( car( q ), cons( a, cdar( q ) ) );
     return q;
   }
}
 
var K = 0;

function createStructure( n ) {
   let a = list( new Node() );
   let p = a;
   
   for( let m = n - 1; m > 0; m-- ) {
      a = cons( new Node(), a );
   }
   
   setCdr( p, a );
   a = list( p );
   
   const unused = a;
   const used = add( traverseRemove( 0, a ), null );
   let x = 0;
   let y = 0;
   
   let i = 0;
   while( !nullp( car( unused ) ) ) {
      x = traverseRemove( traverseRandom() % n, unused );
      y = traverseSelect( traverseRandom() % n, used );
      add( x, used );
      y.sons = cons( x, y.sons );
      x.parents = cons( y, x.parents );
   }
   
   return findRoot( traverseSelect( 0, used ), n );
}

function findRoot( node, n ) {
   while( !(n === 0 || nullp( node.parents )) ) {
      n--;
      node = car( node.parents );
   }
   return node;
}

function traverse( root ) {
   function travers( node, mark ) {
      if( node.mark === mark ) {
      	 return false;
      } else {
      	 node.mark = mark;
      	 COUNT++;
      	 node.entry1 = !node.entry1;
      	 node.entry2 = !node.entry2;
      	 node.entry3 = !node.entry3;
      	 node.entry4 = !node.entry4;
      	 node.entry5 = !node.entry5;
      	 node.entry6 = !node.entry6;
      	 
      	 let sons = node.sons;
      	 
      	 while( !nullp( sons ) ) {
	    travers( car( sons ), mark );
	    sons = cdr( sons );
      	 }
      }
   }
   
   let count = 0;

   MARKER = !MARKER;
   travers( root, MARKER );
   
   return count;
}

function initTraverse() {
   reset();
   ROOT = createStructure( 100 );
}

function runTraverse( n ) {
   initTraverse();
   while( n-- > 0 ) {
      traverse( ROOT );
   }
}
   
function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      runTraverse( 5 );
   }

   runTraverse( 1 );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 2000;

main( "traverse", N ); 

     console.log( "S=", S );
