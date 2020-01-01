// The Gabriel benchmarks, as found on the scheme repository, are      */
// not clean R4RS code. I suspect I'm not the only one wanting fixed   */
// versions, do any have any?                                          */
//                                                                     */
// Expecting a negative answer, I've started fixing them myself. First */
// to be fixed is boyer.scm. The fix consist of:                       */
//                                                                     */
//   1) Removing the assumption that #f equals '()                     */
//   2) Removing the assumption that nil equals '()                    */
//   3) Removing the assumption that symbols have a property list      */
//                                                                     */
// Any comments greatly appreciated.                                   */
//                                                                     */
// Regards                                                             */
// Tommy Thorn                                                         */
// ---- Fixed boyer.scm ----                                           */
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
// File:         boyer.sch
// Description:  The Boyer benchmark
// Author:       Bob Boyer
// Created:      5-Apr-85
// Modified:     10-Apr-85 14:52:20 (Bob Shaw)
//               22-Jul-87 (Will Clinger)
//               17-Dec-19 (Manuel Serrano)
// Language:     Scheme (but see note) the JavaScript
// Status:       Public Domain
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


// Note:  The Common Lisp version of this benchmark returns the wrong
// answer because it uses the Common Lisp equivalent of memv instead of
// member in the falsep and truep procedures.  (The error arose because
// memv is called member in Common Lisp.  Don't ask what member is called,
// unless you want to learn about keyword arguments.)  This Scheme version
// may run a few percent slower than it would if it were equivalent to
// the Common Lisp version, but it works.

//// BOYER -- Logic programming benchmark, originally written by Bob Boyer.
//// Fairly CONS intensive.
"use strict";

/*---------------------------------------------------------------------*/
/*    pair ...                                                         */
/*---------------------------------------------------------------------*/
function pair( car, cdr ) {
   this.car = car;
   this.cdr = cdr;
}

pair.prototype.toString = function() {
   let s = "(" + car( this ).toString();
   if( pairp( cdr( this ) ) ) {
      cdr( this ).foreach( v => s += " " + v.toString() );
   }
   return s + ")";
}

pair.prototype.map = function( proc ) {
   function loop( l ) {
      if( l === nil ) {
      	 return nil;
      } else {
      	 return cons( proc( car( l ) ), loop( cdr( l ) ) );
      }
   }
   
   return loop( this );
}

pair.prototype.foreach = function( proc ) {
   function loop( l ) {
      if( l === nil ) {
      	 return nil;
      } else if( pairp( l ) ) {
	 proc( car( l ) );
	 return loop( cdr( l ) );
      } else {
	 throw "forEach, not a list " + l;
      }
   }
   
   return loop( this );
}

pair.prototype.assq = function( obj ) {
   function loop( l ) {
      if( l === nil ) {
	 return false;
      } else if( caar( l ) === obj ) {
	 return car( l );
      } else {
	 return loop( cdr( l ) );
      }
   }
   
   return loop( this );
}

function assq( l, obj ) {
   if( nullp( l ) ) { 
      return false;
   } else {
      return l.assq( obj );
   }
}

function equal( a, b ) {
   if( a === b ) {
      return true;
   } else if( pairp( a ) && pairp( b ) ) {
      return equal( car( a ), car( b ) )
	 && equal( cdr( a ), cdr( b ) );
   }
}

pair.prototype.member = function( obj ) {
   function loop( l ) {
      if( l === nil ) {
	 return false;
      } else if( equal( car( l ), obj ) ) {
	 return l;
      } else {
	 return loop( cdr( l ) );
      }
   }
   
   return loop( this );
}

function member( l, obj ) {
   if( nullp( l ) ) {
      return false;
   } else {
      return l.member( obj );
   }
}

function listRef( l, i ) {
   if( l === nil ) {
      return false;
   } else if( i === 0 ) {
      return car( l );
   } else {
      return listRef( cdr( l ), i - 1 );
   }
}
   
function listSet( l, i ) {
   if( l === nil ) {
      return false;
   } else if( i === 0 ) {
      return setCar( l, val );
   } else {
      return listSet( cdr( l ), i - 1 );
   }
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

function length( l ) {
   if( nullp( l ) ) {
      return 0;
   } else {
      return 1 + length( cdr( l ) );
   }
}

let unifySubst = nil;
let tempTemp = 0;

//// Rewritten as not to use get and put 
let lemmasPropList = nil;

function getLemmas( s ) {
   let t = assq( lemmasPropList, s );
   
   if( t ) {
      return cdr( t );
   } else {
      return nil;
   }
}

function putLemmas( s, v ) {
   let t = assq( lemmasPropList, s );
   
   if( t ) {
      setCdr( t, v );
   } else {
      lemmasPropList = cons( cons( s, v ), lemmasPropList );
   }
}

function addLemma( term ) {
   if( pairp( term ) && car( term ) === "equal" && pairp( cadr( term ) ) ) {
      putLemmas( car( cadr( term ) ), 
	 cons( term, getLemmas( car( cadr( term ) ) ) ) );
   } else {
      throw "ADD-LEMA did not like term: " + term;
   }
}

function addLemmaLst( lst ) {
   if( nullp( lst ) ) {
      return true;
   } else {
      addLemma( car( lst ) );
      addLemmaLst( cdr( lst ) );
   }
}

function applySubst( alist, term ) {
   if( !(pairp( term ) ) ) {
      tempTemp = assq( alist, term );
      
      if( tempTemp ) {
	 return cdr( tempTemp );
      } else {
	 return term;
      } 
   } else {
      return cons( car( term ), applySubstLst( alist, cdr( term ) ) );
   }
}

function applySubstLst( alist, lst ) {
   if( nullp( lst ) ) {
      return nil;
   } else {
      return cons( applySubst( alist, car( lst ) ),
	 applySubstLst( alist, cdr( lst ) ) );
   }
}

function falsep( x, lst ) {
   if( car( x ) === "f" && nullp( cdr( x ) ) ) {
      return true;
   } else {
      return member( lst, x );
   }
}

function truep( x, lst ) {
   if( car( x ) === "t" && nullp( cdr( x ) ) ) {
      return true;
   } else {
      return member( lst, x );
   }
}

function oneWayUnify( term1, term2 ) {
   unifySubst = nil;
   return oneWayUnify1( term1, term2 );
}

function oneWayUnify1( term1, term2 ) {
   if( !pairp( term2 ) ) {
      tempTemp = assq( unifySubst, term2 );
      if( tempTemp ) {
	 return term1 === cdr( tempTemp );
      } else {
	 unifySubst = cons( cons( term2, term1 ), unifySubst );
	 return true;
      }
   } else if( !pairp( term1 ) ) {
      return false;
   } else if( car( term1 ) === car( term2 ) ) {
      return oneWayUnify1Lst( cdr( term1 ), cdr( term2 ) );
   } else {
      return false;
   }
}

function oneWayUnify1Lst( lst1, lst2 ) {
   if( nullp( lst1 ) ) {
      return true;
   } else if( oneWayUnify1( car( lst1 ), car( lst2 ) ) ) {
      return oneWayUnify1Lst( cdr( lst1 ), cdr( lst2 ) );
   } else {
     return false;
   }
}

function rewrite( term ) {
   if( !pairp( term ) ) {
      return term;
   } else {
      return rewriteWithLemmas( cons( car( term ), rewriteArgs( cdr( term ) ) ),
	 getLemmas( car( term ) ) );
   }
}

function rewriteArgs( lst ) {
   if( nullp( lst ) ) {
      return nil;
   } else {
      return cons( rewrite( car( lst ) ), rewriteArgs( cdr( lst ) ) );
   }
}

function rewriteWithLemmas( term, lst ) {
   if( nullp( lst ) ) {
      return term;
   } else if( oneWayUnify( term, cadr( car( lst ) ) ) ) {
      return rewrite( applySubst( unifySubst, caddr( car( lst ) ) ) );
   } else {
      return rewriteWithLemmas( term, cdr( lst ) );
   }
}

const allLemas = 
   list(
      list("equal", list("compile", "form"), list("reverse", list("codegen", list("optimize", "form"), list("nil")))), 
      list("equal", list("eqp", "x", "y"), list("equal", list("fix", "x"), list("fix", "y"))), 
      list("equal", list("greaterp", "x", "y"), list("lessp", "y", "x")), 
      list("equal", list("lesseqp", "x", "y"), list("not", list("lessp", "y", "x"))), 
      list("equal", list("greatereqp", "x", "y"), list("not", list("lessp", "x", "y"))), 
      list("equal", list("boolean", "x"), list("or", list("equal", "x", list("t")), list("equal", "x", list("f")))), 
      list("equal", list("iff", "x", "y"), list("and", list("implies", "x", "y"), list("implies", "y", "x"))), 
      list("equal", list("even1", "x"), list("if", list("zerop", "x"), list("t"), list("odd", list("-fx", "x", 1)))), 
      list("equal", list("countps-", "l", "pred"), list("countps-loop", "l", "pred", list("zero"))), 
      list("equal", list("fact-", "i"), list("fact-loop", "i", 1)), 
      list("equal", list("reverse-", "x"), list("reverse-loop", "x", list("nil"))), 
      list("equal", list("divides", "x", "y"), list("zerop", list("remainder", "y", "x"))), 
      list("equal", list("assume-true", "var", "alist"), list("cons", list("cons", "var", list("t")), "alist")), 
      list("equal", list("assume-false", "var", "alist"), list("cons", list("cons", "var", list("f")), "alist")), 
      list("equal", list("tautology-checker", "x"), list("tautologyp", list("normalize", "x"), list("nil"))), 
      list("equal", list("falsify", "x"), list("falsify1", list("normalize", "x"), list("nil"))), 
      list("equal", list("prime", "x"), list("and", list("not", list("zerop", "x")), list("not", list("equal", "x", list("add1", list("zero")))), list("prime1", "x", list("-fx", "x", 1)))), 
      list("equal", list("and", "p", "q"), list("if", "p", list("if", "q", list("t"), list("f")), list("f"))), 
      list("equal", list("or", "p", "q"), list("if", "p", list("t"), list("if", "q", list("t"), list("f")), list("f"))), 
      list("equal", list("not", "p"), list("if", "p", list("f"), list("t"))), 
      list("equal", list("implies", "p", "q"), list("if", "p", list("if", "q", list("t"), list("f")), list("t"))), 
      list("equal", list("fix", "x"), list("if", list("numberp", "x"), "x", list("zero"))), 
      list("equal", list("if", list("if", "a", "b", "c"), "d", "e"), list("if", "a", list("if", "b", "d", "e"), list("if", "c", "d", "e"))), 
      list("equal", list("zerop", "x"), list("or", list("equal", "x", list("zero")), list("not", list("numberp", "x")))), 
      list("equal", list("plus", list("plus", "x", "y"), "z"), list("plus", "x", list("plus", "y", "z"))), 
      list("equal", list("equal", list("plus", "a", "b"), list("zero")), list("and", list("zerop", "a"), list("zerop", "b"))), 
      list("equal", list("difference", "x", "x"), list("zero")), 
      list("equal", list("equal", list("plus", "a", "b"), list("plus", "a", "c")), list("equal", list("fix", "b"), list("fix", "c"))), 
      list("equal", list("equal", list("zero"), list("difference", "x", "y")), list("not", list("lessp", "y", "x"))), 
      list("equal", list("equal", "x", list("difference", "x", "y")), list("and", list("numberp", "x"), list("or", list("equal", "x", list("zero")), list("zerop", "y")))), 
      list("equal", list("meaning", list("plus-tree", list("append", "x", "y")), "a"), list("plus", list("meaning", list("plus-tree", "x"), "a"), list("meaning", list("plus-tree", "y"), "a"))), 
      list("equal", list("meaning", list("plus-tree", list("plus-fringe", "x")), "a"), list("fix", list("meaning", "x", "a"))), 
      list("equal", list("append", list("append", "x", "y"), "z"), list("append", "x", list("append", "y", "z"))), 
      list("equal", list("reverse", list("append", "a", "b")), list("append", list("reverse", "b"), list("reverse", "a"))), 
      list("equal", list("times", "x", list("plus", "y", "z")), list("plus", list("times", "x", "y"), list("times", "x", "z"))), 
      list("equal", list("times", list("times", "x", "y"), "z"), list("times", "x", list("times", "y", "z"))), 
      list("equal", list("equal", list("times", "x", "y"), list("zero")), list("or", list("zerop", "x"), list("zerop", "y"))), 
      list("equal", list("exec", list("append", "x", "y"), "pds", "envrn"), list("exec", "y", list("exec", "x", "pds", "envrn"), "envrn")), 
      list("equal", list("mc-flatten", "x", "y"), list("append", list("flatten", "x"), "y")), 
      list("equal", list("member", "x", list("append", "a", "b")), list("or", list("member", "x", "a"), list("member", "x", "b"))), 
      list("equal", list("member", "x", list("reverse", "y")), list("member", "x", "y")), 
      list("equal", list("length", list("reverse", "x")), list("length", "x")), 
      list("equal", list("member", "a", list("intersect", "b", "c")), list("and", list("member", "a", "b"), list("member", "a", "c"))), 
      list("equal", list("nth", list("zero"), "i"), list("zero")), 
      list("equal", list("exp", "i", list("plus", "j", "k")), list("times", list("exp", "i", "j"), list("exp", "i", "k"))), 
      list("equal", list("exp", "i", list("times", "j", "k")), list("exp", list("exp", "i", "j"), "k")), 
      list("equal", list("reverse-loop", "x", "y"), list("append", list("reverse", "x"), "y")), 
      list("equal", list("reverse-loop", "x", list("nil")), list("reverse", "x")), 
      list("equal", list("count-list", "z", list("sort-lp", "x", "y")), list("plus", list("count-list", "z", "x"), list("count-list", "z", "y"))), 
      list("equal", list("equal", list("append", "a", "b"), list("append", "a", "c")), list("equal", "b", "c")), 
      list("equal", list("plus", list("remainder", "x", "y"), list("times", "y", list("quotient", "x", "y"))), list("fix", "x")), 
      list("equal", list("power-eval", list("big-plus1", "l", "i", "base"), "base"), list("plus", list("power-eval", "l", "base"), "i")), 
      list("equal", list("power-eval", list("big-plus", "x", "y", "i", "base"), "base"), list("plus", "i", list("plus", list("power-eval", "x", "base"), list("power-eval", "y", "base")))), 
      list("equal", list("remainder", "y", 1), list("zero")), 
      list("equal", list("lessp", list("remainder", "x", "y"), "y"), list("not", list("zerop", "y"))), 
      list("equal", list("remainder", "x", "x"), list("zero")), 
      list("equal", list("lessp", list("quotient", "i", "j"), "i"), list("and", list("not", list("zerop", "i")), list("or", list("zerop", "j"), list("not", list("equal", "j", 1))))), 
      list("equal", list("lessp", list("remainder", "x", "y"), "x"), list("and", list("not", list("zerop", "y")), list("not", list("zerop", "x")), list("not", list("lessp", "x", "y")))), 
      list("equal", list("power-eval", list("power-rep", "i", "base"), "base"), list("fix", "i")), 
      list("equal", list("power-eval", list("big-plus", list("power-rep", "i", "base"), list("power-rep", "j", "base"), list("zero"), "base"), "base"), list("plus", "i", "j")), 
      list("equal", list("gcd", "x", "y"), list("gcd", "y", "x")), 
      list("equal", list("nth", list("append", "a", "b"), "i"), list("append", list("nth", "a", "i"), list("nth", "b", list("difference", "i", list("length", "a"))))), 
      list("equal", list("difference", list("plus", "x", "y"), "x"), list("fix", "y")), 
      list("equal", list("difference", list("plus", "y", "x"), "x"), list("fix", "y")), 
      list("equal", list("difference", list("plus", "x", "y"), list("plus", "x", "z")), list("difference", "y", "z")), 
      list("equal", list("times", "x", list("difference", "c", "w")), list("difference", list("times", "c", "x"), list("times", "w", "x"))), 
      list("equal", list("remainder", list("times", "x", "z"), "z"), list("zero")), 
      list("equal", list("difference", list("plus", "b", list("plus", "a", "c")), "a"), list("plus", "b", "c")), 
      list("equal", list("difference", list("add1", list("plus", "y", "z")), "z"), list("add1", "y")), 
      list("equal", list("lessp", list("plus", "x", "y"), list("plus", "x", "z")), list("lessp", "y", "z")), 
      list("equal", list("lessp", list("times", "x", "z"), list("times", "y", "z")), list("and", list("not", list("zerop", "z")), list("lessp", "x", "y"))), 
      list("equal", list("lessp", "y", list("plus", "x", "y")), list("not", list("zerop", "x"))), 
      list("equal", list("gcd", list("times", "x", "z"), list("times", "y", "z")), list("times", "z", list("gcd", "x", "y"))), 
      list("equal", list("value", list("normalize", "x"), "a"), list("value", "x", "a")), 
      list("equal", list("equal", list("flatten", "x"), list("cons", "y", list("nil"))), list("and", list("nlistp", "x"), list("equal", "x", "y"))), 
      list("equal", list("listp", list("gopher", "x")), list("listp", "x")), 
      list("equal", list("samefringe", "x", "y"), list("equal", list("flatten", "x"), list("flatten", "y"))), 
      list("equal", list("equal", list("greatest-factor", "x", "y"), list("zero")), list("and", list("or", list("zerop", "y"), list("equal", "y", 1)), list("equal", "x", list("zero")))), 
      list("equal", list("equal", list("greatest-factor", "x", "y"), 1), list("equal", "x", 1)), 
      list("equal", list("numberp", list("greatest-factor", "x", "y")), list("not", list("and", list("or", list("zerop", "y"), list("equal", "y", 1)), list("not", list("numberp", "x"))))), 
      list("equal", list("times-list", list("append", "x", "y")), list("times", list("times-list", "x"), list("times-list", "y"))), 
      list("equal", list("prime-list", list("append", "x", "y")), list("and", list("prime-list", "x"), list("prime-list", "y"))), 
      list("equal", list("equal", "z", list("times", "w", "z")), list("and", list("numberp", "z"), list("or", list("equal", "z", list("zero")), list("equal", "w", 1)))), 
      list("equal", list("greatereqpr", "x", "y"), list("not", list("lessp", "x", "y"))), 
      list("equal", list("equal", "x", list("times", "x", "y")), list("or", list("equal", "x", list("zero")), list("and", list("numberp", "x"), list("equal", "y", 1)))), 
      list("equal", list("remainder", list("times", "y", "x"), "y"), list("zero")), 
      list("equal", list("equal", list("times", "a", "b"), 1), list("and", list("not", list("equal", "a", list("zero"))), list("not", list("equal", "b", list("zero"))), list("numberp", "a"), list("numberp", "b"), list("equal", list("-fx", "a", 1), list("zero")), list("equal", list("-fx", "b", 1), list("zero")))), 
      list("equal", list("lessp", list("length", list("delete", "x", "l")), list("length", "l")), list("member", "x", "l")), 
      list("equal", list("sort2", list("delete", "x", "l")), list("delete", "x", list("sort2", "l"))), 
      list("equal", list("dsort", "x"), list("sort2", "x")), 
      list("equal", list("length", list("cons", "x1", list("cons", "x2", list("cons", "x3", list("cons", "x4", list("cons", "x5", list("cons", "x6", "x7"))))))), list("plus", 6, list("length", "x7"))), 
      list("equal", list("difference", list("add1", list("add1", "x")), 2), list("fix", "x")), 
      list("equal", list("quotient", list("plus", "x", list("plus", "x", "y")), 2), list("plus", "x", list("quotient", "y", 2))), 
      list("equal", list("sigma", list("zero"), "i"), list("quotient", list("times", "i", list("add1", "i")), 2)), 
      list("equal", list("plus", "x", list("add1", "y")), list("if", list("numberp", "y"), list("add1", list("plus", "x", "y")), list("add1", "x"))), 
      list("equal", list("equal", list("difference", "x", "y"), list("difference", "z", "y")), list("if", list("lessp", "x", "y"), list("not", list("lessp", "y", "z")), list("if", list("lessp", "z", "y"), list("not", list("lessp", "y", "x")), list("equal", list("fix", "x"), list("fix", "z"))))), 
      list("equal", list("meaning", list("plus-tree", list("delete", "x", "y")), "a"), list("if", list("member", "x", "y"), list("difference", list("meaning", list("plus-tree", "y"), "a"), list("meaning", "x", "a")), list("meaning", list("plus-tree", "y"), "a"))), 
      list("equal", list("times", "x", list("add1", "y")), list("if", list("numberp", "y"), list("plus", "x", list("times", "x", "y")), list("fix", "x"))), 
      list("equal", list("nth", list("nil"), "i"), list("if", list("zerop", "i"), list("nil"), list("zero"))), 
      list("equal", list("last", list("append", "a", "b")), list("if", list("listp", "b"), list("last", "b"), list("if", list("listp", "a"), list("cons", list("car", list("last", "a")), "b"), "b"))), 
      list("equal", list("equal", list("lessp", "x", "y"), "z"), list("if", list("lessp", "x", "y"), list("equal", "t", "z"), list("equal", "f", "z"))), 
      list("equal", list("assignment", "x", list("append", "a", "b")), list("if", list("assignedp", "x", "a"), list("assignment", "x", "a"), list("assignment", "x", "b"))), 
      list("equal", list("car", list("gopher", "x")), list("if", list("listp", "x"), list("car", list("flatten", "x")), list("zero"))), 
      list("equal", list("flatten", list("cdr", list("gopher", "x"))), list("if", list("listp", "x"), list("cdr", list("flatten", "x")), list("cons", list("zero"), list("nil")))), 
      list("equal", list("quotient", list("times", "y", "x"), "y"), list("if", list("zerop", "y"), list("zero"), list("fix", "x"))), 
      list("equal", list("get", "j", list("set", "i", "val", "mem")), list("if", list("eqp", "j", "i"), "val", list("get", "j", "mem"))));

function setup() {
   unifySubst = nil;
   tempTemp = 0;
   lemmasPropList = nil;
   addLemmaLst( allLemas );
}

function tautologyp( x, trueLst, falseLst ) {
   if( truep( x, trueLst ) ) {
      return true;
   } else if( falsep( x, falseLst ) ) {
      return false;
   } else if( !pairp( x ) ) {
      return false;
   } else if( car( x ) === "if" ) {
      if( truep( cadr( x ), trueLst ) ) {
	 return tautologyp( caddr( x ), trueLst, falseLst );
      } else if( falsep( cadr( x ), falseLst ) ) {
	 return tautologyp( cadddr( x ), trueLst, falseLst );
      } else {
	 return tautologyp( caddr( x ), cons( cadr( x ), trueLst ), falseLst )
	    && tautologyp( cadddr( x ), trueLst, cons( cadr( x ), falseLst ) );
      }
   } else {
      return false;
   }
}

function tautp( x ) {
   return tautologyp( rewrite( x ), nil, nil );
}

function test() {
   let term = applySubst( quote1, quote2 );
   
   return tautp( term );
}

function bench() {
   setup();
   return test();
}

const quote1 = 
   list( 
      list( "x", "f", list( "plus", list( "plus", "a", "b" ),
			 list( "plus", "c", list( "zero" ) ) ) ),
      list( "y", "f", list( "times", list( "times", "a", "b" ),
			 list( "plus", "c", "d" ) ) ),
      list( "z", "f", list( "reverse", list( "append", 
					  list( "append", "a", "b" ),
					  list( "nil" ) ) ) ),
      list( "u", "equal", list( "plus", "a", "b" ), list( "difference", "x", "y" ) ),
      list( "w", "lessp", list( "remainder", "a", "b" ), list( "member", "a", list( "length", "b" ) ) ) );


const quote2 = 
   list( "implies", list( "and", list( "implies", "x", "y" ),
		       list( "and", list( "implies", "y", "z" ),
			  list( "and", list( "implies", "z", "u" ),
			     list( "implies", "u", "w" )))),
      list( "implies", "x", "w" ) );

/*---------------------------------------------------------------------*/
/*    main ...                                                         */
/*---------------------------------------------------------------------*/
function main( n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( "boyer(", n, ")..." );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      res = bench();
   }

   console.log( "res=", res );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 4
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 40;

main( N );
    
   
	 
     
function toString( x ) {
   if( pairp( x ) ) {
      return x.toString();
   } if( !x ) {
	if( x === nil ) {
	   return "()";
	} else {
	   return "#f";
	}
     } else if( x === true ) {
	return "#t";
     } else {
       return x;
     }
}
