// File: "earley.scm"   (c) 1990, Marc Feeley

// Earley parser.

// (make-parser grammar lexer) is used to create a parser from the grammar
// description `grammar' and the lexer function `lexer'.
//
// A grammar is a list of definitions.  Each definition defines a non-terminal
// by a set of rules.  Thus a definition has the form: (nt rule1 rule2...).
// A given non-terminal can only be defined once.  The first non-terminal
// defined is the grammar's goal.  Each rule is a possibly empty list of
// non-terminals.  Thus a rule has the form: (nt1 nt2...).  A non-terminal
// can be any scheme value.  Note that all grammar symbols are treated as
// non-terminals.  This is fine though because the lexer will be outputing
// non-terminals.
//
// The lexer defines what a token is and the mapping between tokens and
// the grammar's non-terminals.  It is a function of one argument, the input,
// that returns the list of tokens corresponding to the input.  Each token is
// represented by a list.  The first element is some `user-defined' information
// associated with the token and the rest represents the token's class(es) (as a
// list of non-terminals that this token corresponds to).
//
// The result of `make-parser' is a function that parses the single input it
// is given into the grammar's goal.  The result is a `parse' which can be
// manipulated with the procedures: `parse->parsed?', `parse->trees'
// and `parse->nb-trees' (see below).
//
// Let's assume that we want a parser for the grammar
//
//  S -> x = E
//  E -> E + E | V
//  V -> V y |
//
// and that the input to the parser is a string of characters.  Also, assume we
// would like to map the characters `x', `y', `+' and `=' into the corresponding
// non-terminals in the grammar.  Such a parser could be created with
//
// (make-parser
//   '(
//      (s (x = e))
//      (e (e + e) (v))
//      (v (v y) ())
//    )
//   (lambda (str)
//     (map (lambda (char)
//            (list char // user-info = the character itself
//                  (case char
//                    ((#\x) 'x)
//                    ((#\y) 'y)
//                    ((#\+) '+)
//                    ((#\=) '=)
//                    (else (error "lexer error")))))
//          (string->list str)))
// )
//
// An alternative definition (that does not check for lexical errors) is
//
// (make-parser
//   '(
//      (s (#\x #\= e))
//      (e (e #\+ e) (v))
//      (v (v #\y) ())
//    )
//   (lambda (str) (map (lambda (char) (list char char)) (string->list str)))
// )
//
// To help with the rest of the discussion, here are a few definitions:
//
// An input pointer (for an input of `n' tokens) is a value between 0 and `n'.
// It indicates a point between two input tokens (0 = beginning, `n' = end).
// For example, if `n' = 4, there are 5 input pointers:
//
//   input                   token1     token2     token3     token4
//   input pointers       0          1          2          3          4
//
// A configuration indicates the extent to which a given rule is parsed (this
// is the common `dot notation').  For simplicity, a configuration is
// represented as an integer, with successive configurations in the same
// rule associated with successive integers.  It is assumed that the grammar
// has been extended with rules to aid scanning.  These rules are of the
// form `nt ->', and there is one such rule for every non-terminal.  Note
// that these rules are special because they only apply when the corresponding
// non-terminal is returned by the lexer.
//
// A configuration set is a configuration grouped with the set of input pointers
// representing where the head non-terminal of the configuration was predicted.
//
// Here are the rules and configurations for the grammar given above:
//
//  S -> .         \
//       0          |
//  x -> .          |
//       1          |
//  = -> .          |
//       2          |
//  E -> .          |
//       3           > special rules (for scanning)
//  + -> .          |
//       4          |
//  V -> .          |
//       5          |
//  y -> .          |
//       6         /
//  S -> .  x  .  =  .  E  .
//       7     8     9     10
//  E -> .  E  .  +  .  E  .
//       11    12    13    14
//  E -> .  V  .
//       15    16
//  V -> .  V  .  y  .
//       17    18    19
//  V -> .
//       20
//
// Starters of the non-terminal `nt' are configurations that are leftmost
// in a non-special rule for `nt'.  Enders of the non-terminal `nt' are
// configurations that are rightmost in any rule for `nt'.  Predictors of the
// non-terminal `nt' are configurations that are directly to the left of `nt'
// in any rule.
//
// For the grammar given above,
//
//   Starters of V   = (17 20)
//   Enders of V     = (5 19 20)
//   Predictors of V = (15 17)
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
   } else if( !nullp( cdr( this ) ) ) {
      s += " . " + cdr( this );
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

pair.prototype.reverse = function() {
   function loop( l, acc ) {
      if( nullp( l ) ) {
	 return acc;
      } else {
	 return loop( cdr( l ), cons( car( l ), acc ) );
      }
   }
   return loop( this, nil );
}

function append( l1, l2 ) {
   if( nullp( l1 ) ) {
      return l2;
   } else {
      return cons( car( l1 ), append( cdr( l1 ), l2 ) );
   }
}

pair.prototype.toArray = function() {
   var a = new Array();
   
   this.foreach( e => a.push( e ) );
   return a;
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

function member( obj, l ) {
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

function listp( o ) {
   if( pairp( o ) ) {
      if( nullp( cdr( o ) ) ) {
	 return true;
      } else if( pairp( cdr( o ) ) ) {
	 return listp( cdr( o ) );
      } else {
	 return false;
      }
   } else {
      return false;
   }
}

function length( l ) {
   if( nullp( l ) ) {
      return 0;
   } else {
      return 1 + length( cdr( l ) );
   }
}

let k = 0;
let kl = 50000;
const isdebug = true;

function debug( ... args ) {
   function show( a ) {
      if( a === false ) return "#f";
      if( a === true ) return "#t";
      if( a === null ) return "()";
      if( a instanceof Array ) return a.map( show );
      if( pairp( a ) ) return a.toString();
      return a;
   }

   if( isdebug ) {
      let s = k++ + ": ";
      args.forEach( a => s += show( a ) );
      console.log( s );
      if( k === kl ) { console.log( "aborting..." ); process.exit( 0 ); }
   }
}

/*---------------------------------------------------------------------*/
/*    earley                                                           */
/*---------------------------------------------------------------------*/
function makeParser( grammar, lexer ) {
   
   function nonTerminals( grammar ) {
      
      function addNt( nt, nts) {
	 debug( "add-nt ", length( nts ), " ", member( nt, nts ), " ", nts );
	 if( member( nt, nts ) ) {
	    return nts;
	 } else {
	    return cons( nt, nts );
	 }
      }
      
      function defLoop( defs, nts ) {
	 if( pairp( defs ) ) {
	    let def = car( defs );
	    let head = car( def );
	    
	    function ruleLoop( rules, nts ) {
	       if( pairp( rules ) ) {
	       	  let rule = car( rules );
	       
	       	  function loop( l, nts ) {
		     if( pairp( l ) ) {
		     	let nt = car( l );
		     	return loop( cdr( l ), addNt( nt, nts ) );
		     } else {
		     	return ruleLoop( cdr( rules ), nts );
		     }
	       	  }
		  
		  return loop( rule, nts );
	       } else {
		  return defLoop( cdr( defs ), nts );
	       }
	    }
	    
	    return ruleLoop( cdr( def ), addNt( head, nts ) );
	 } else {
	    return nts.reverse().toArray();
	 }
      }
      
      debug( "grammar ", grammar );
      return defLoop( grammar, nil );
   }

   function index( nt, nts ) {
      debug( "index ", nts.length );
      for( let i = nts.length - 1; i >= 0; i-- ) {
	 if( equal( nts[ i ], nt ) ) {
	    return i;
	 }
      }
      return false;
   }
   
   function nbConfigurations( grammar ) {
      
      function defLoop( defs, nbConfs ) {
	 debug( "nbConfigurations.def-loop.1 ", nbConfs, " ", defs );
	 if( pairp( defs ) ) {
	    let def = car( defs );
	    
	    function ruleLoop( rules, nbConfs ) {
	       debug( "ruleLoop rules=", rules, " ", nbConfs );
	       if( pairp( rules ) ) {
		  let rule = car( rules );
		  
		  for( let l = rule; pairp( l ); l = cdr( l ), nbConfs++ );
		     debug( "nbConfigurations.ruleLoop ", nbConfs );
                  return ruleLoop( cdr( rules ), nbConfs + 1 );
	       } else {
		  return defLoop( cdr( defs ), nbConfs );
	       }
	    }
	    
	    return ruleLoop( cdr( def ), nbConfs );
	 } else {
	    return nbConfs;
	 }
      }
      
      return defLoop( grammar, 0 );
   }
   
   let nts = nonTerminals( grammar );
   debug( "nts.0=", nts );
   let nbNts = nts.length;
   let nbConfs = nbConfigurations( grammar ) + nbNts;
   debug( "nbConfs=", nbConfs, " ", nbNts )
   let starters = new Array( nbNts );
   let enders = new Array( nbNts );
   let predictors = new Array( nbNts );
   let steps = new Array( nbConfs );
   let names = new Array( nbConfs );
   
   starters.fill( nil );
   enders.fill( nil );
   predictors.fill( nil );
   steps.fill( false );
   names.fill( false );
   
   function setupTables( grammar, nts, starters, enders, predictors, steps, names ) {
      function addConf( conf, nt, nts, klass ) {
	 debug( "addConf class=", klass );
	 let i = index( nt, nts );
	 klass[ i ] = cons( conf, klass[ i ] );
      }
      
      let nbNts = nts.length;
      
      debug( "nb-nts.2 ", nbNts );
      debug( "starters=", starters );
      
      for( let i = nbNts - 1; i >=0; i-- ) {
	 steps[ i ] = i - nbNts;
	 names[ i ] = list( nts[ i ], 0 );
	 enders[ i ] = list( i );
      }
      
      function defLoop( defs, conf ) {
	 debug( "setupTables.defLoop.1 ", length( defs ) );
	 if( pairp( defs ) ) {
	    let def = car( defs );
	    let head = car( def );
	    
	    function ruleLoop( rules, conf, ruleNum ) {
	       if( pairp( rules ) ) {
		  const rule = car( rules );
		  names[ conf ] = list( head, ruleNum );
		  debug( "add-conf.1 ", starters );
		  addConf( conf, head, nts, starters );
		  
		  function loop( l, conf ) {
		     if( pairp( l ) ) {
			let nt = car( l );
			steps[ conf ] = index( nt, nts );
		  debug( "add-conf.2 ", predictors );
			addConf( conf, nt, nts, predictors );
			return loop( cdr( l ), conf + 1 );
		     } else {
			steps[ conf ] = index( head, nts ) - nbNts;
		  debug( "add-conf.3 ", enders );
			addConf( conf, head, nts, enders );
			return ruleLoop( cdr( rules ), conf + 1, ruleNum + 1 );
		     }
		  }
		  
		  return loop( rule, conf );
	       } else {
		  return defLoop( cdr( defs), conf );
	       }
      	    }
      	    
      	    return ruleLoop( cdr( def ), conf, 1 );
   	 }
      }
      
      return defLoop( grammar, nts.length );
   }
      
   setupTables( grammar, nts, starters, enders, predictors, steps, names );
   
   const parserDescr = 
      { lexer: lexer, 
	nts: nts, 
	starters: starters, 
	enders: enders, 
	predictors: predictors, 
	steps: steps, 
	names: names };
      
   function parse( input ) {
      
      function index( nt, nts ) {
	 debug( "index.2 ", nts.length );
	 for( let i = nts.length - 1; i >= 0; i-- ) {
	    debug( "index.2.b ", i, " ", nts[ i ] );
	    if( nts[ i ] == nt ) {
	       return i;
	    } 
	 }
	 return false;
      }
      
      function compTok( tok, nts ) {
	 debug( "comp-tok ", nts.length );
	 function loop( l1, l2 ) {
	    if( pairp( l1 ) ) {
	       let i = index( car( l1 ), nts );
	       
	       if( i ) {
		  return loop( cdr( l1 ), cons( i, l2 ) );
	       } else {
		  return loop( cdr( l1 ), l2 );
	       }
	    } else {
	       return cons( car( tok ), l2.reverse() );
	    }
	 }
	 
	 return loop( cdr( tok ), null );
      }
      
      function inputToTokens( input, lexer, nts ) {
	 debug( "inputToTokens ", input );
	 return lexer( input ).toArray().map( tok => compTok( tok, nts ) );
      }
      
      function makeStates( nbToks, nbConfs ) {
	 debug( "make-states ", nbToks, " ", nbConfs );
	 const states = new Array( nbToks );
	 states.fill( false );
	 
	 for( let i = nbToks; i >= 0; i-- ) {
	    const v = new Array( nbConfs + 1 );
	    v.fill( false );
	    v[ 0 ] = -1;
	    states[ i ] = v;
	 }
	 
	 return states;
      }
      
      function confSetGet( state, conf ) {
	 return state[ conf + 1 ];
      }
      
      function confSetGetStar( state, stateNum, conf ) {
	 debug( "confSetGetStar ", state, " ", stateNum, " ", conf );
	 const confSet = confSetGet( state, conf );
	 
	 if( confSet ) {
	    return confSet;
	 } else {
	    const res = new Array( stateNum + 6 );
	    res.fill( false );
	    res[ 1 ] = -3;
	    res[ 2 ] = -1;
	    res[ 3 ] = -1;
	    res[ 4 ] = -1;
	    
	    state[ conf + 1 ] = res;
	    
	    return res;
	 }
      }
      
      function confSetMergeNew( confSet ) {
	 confSet[ confSet[ 1 ] + 5 ] = confSet[ 4 ];
	 confSet[ 1 ] = confSet[ 3 ];
	 confSet[ 3 ] = -1;
	 confSet[ 4 ] = -1;
      }
      
      function confSetHead( confSet ) {
	 return confSet[ 2 ];
      }
      
      function confSetNext( confSet, i ) {
	 debug( "confSetNext ", confSet, " ", i, " -> ", confSet[ i + 5 ] );
	 return confSet[ i + 5 ];
      }

      function confSetMemberp( state, conf, i ) {
	 debug( "confSetMemberp ", state, " ", conf, " ", i );
	 const confSet = state[ conf + 1 ];
	 if( confSet !== false ) {
	    return confSetNext( confSet, i ) !== false;
	 } else {
	    return false;
	 }
      }
      
      function confSetAdjoin( state, confSet, conf, i ) {
	 debug( "confSetAdjoin ", state, " ", confSet, " ", conf, " ", i );
	 const tail = confSet[ 3 ];
	 confSet[ i + 5 ] = -1;
	 confSet[ tail + 5 ] = i;
	 confSet[ 3 ] = i;
	 if( tail < 0 ) {
	    confSet[ 0 ] = state[ 0 ];
	    state[ 0 ] = conf;
	 }
      }
      
      function confSetAdjoinStar( states, stateNum, l, i ) {
	 debug( "confSetAdjoinStar ", stateNum, " ", l, " ", i );
	 const state = states[ stateNum ];
	 for( l1 = l; pairp( l1 ); l1 = cdr( l1 ) ) {
	    const conf = car( l1 );
	    const confSet = confSetGetStar( state, stateNum, conf );
	    debug( "confSetAdjoinStar.2 ", confSet );
	    if( confSetNext( confSet, i ) === false) {
	       confSetAdjoin( state, confSet, conf, i );
	    }
	 }
      }
      
      function confSetAdjoinStarStar( states, statesStar, stateNum, conf, i ) {
	 debug( "confSetAdjoinStarStar ", stateNum, " ", conf, " ", i );
	 const state = states[ stateNum ];
	 if( confSetMemberp( state, conf, i ) ) {
	    const stateStar = statesStar[ stateNum ];
	    const confSetStar = confSetGetStar( stateStar, stateNum, conf );
	    
	    if( confSetNext( confSetStar,i ) === false ) {
	       confSetAdjoin( stateStar, confSetStar, conf, i );
	    }
	    return true;
	 } else {
	    return false;
	 }
      }
      
      function confSetUnion( state, confSet, conf, otherSet ) {
	 debug( "confSetUnion ", confSet, " ", conf, " ", otherSet );
	 for( let i = confSetHead( otherSet ); 
	 i >= 0; 
	 i = confSetNext( otherSet, i ) ) {
	    debug( "confSetUnion.for i=", i );
	    if( confSetNext( confSet, i ) === false ) {
	       debug( "confSetUnion.for.confSetAdjoin..." );
	       confSetAdjoin( state, confSet, conf, i );
	    }
	 }
      }
      
      function forw( states, stateNum, starters, enders, predictors, steps, nts ) {
	 function predict( state, stateNum, confSet, conf, nt, starters, enders ) {
	    debug( "predict.loop1 ", state, " sn=", stateNum, " cs=", confSet, " c=", conf, " nt=", nt, " ", length( starters[ nt ] ) );
	    for( let l = starters[ nt ]; pairp( l ); l = cdr( l ) ) {
	       const starter = car( l );
	       debug( "predict.starter=", starter );
	       const starterSet = confSetGetStar( state, stateNum, starter );
	       
	       if( confSetNext( starterSet, stateNum ) === false ) {
		  confSetAdjoin( state, starterSet, starter, stateNum );
	       }
	    }

	    debug( "predict.loop2 l=", length( enders[ nt ] ) );
	    for( let l = enders[ nt ]; pairp( l ); l = cdr( l ) ) {
	       const ender = car( l );
	       debug( "predict.ender=", ender );
	       if( confSetMemberp( state, ender, stateNum ) ) {
		  const next = conf + 1;
		  const nextSet = confSetGetStar( state, stateNum, next );
		  debug( "predict.loop2.member next=", next, " ns=", nextSet );
		  confSetUnion( state, nextSet, next, confSet );
	       }
	    }
	 }
	 
	 function reduce( states, state, stateNum, confSet, head, preds ) {
	    debug( "reduce ", state, " ", stateNum, " ", confSet, " ", preds );
	    function loop1( l ) {
	       if( pairp( l ) ) {
		  const predxxx = car( l );
		  debug( "reduce.loop1 ", predxxx );
		  
		  function loop2( i ) {
		     if( i >= 0 ) {
			const predSet = confSetGet( states[ i ], predxxx );
			debug( "reduce.loop2 ", i, " ", predSet );
			if( predSet ) {
			   const next = predxxx + 1;
			   const nextSet = confSetGetStar( state, stateNum, next );
			   debug( "reduce.loop2.predSet ", next, " ", nextSet );
			   confSetUnion( state, nextSet, next, predSet );
			} 
			return loop2( confSetNext( confSet, i ) );
		     } else {
			return loop1( cdr( l ) );
		     }
		  }
		  
		  return loop2( head );
	       } else {
		  return false;
	       }
	    }
	    
	    return loop1( preds );
	 }
	 
	 const state = states[ stateNum ];
	 const nbNts = nts.length;
	 
	 debug( "state=", state, " s[3]=", state[ 3 ] );
	 while( true ) {
	    const conf = state[ 0 ];
	    debug( "while.conf=", conf );
	    if( conf >= 0 ) {
	       const step = steps[ conf ];
	       const confSet = state[ conf + 1 ];
	       debug( "while.confSet=", confSet );
	       const head = confSet[ 4 ];
	       
	       state[ 0 ] = confSet[ 0 ];
	       confSetMergeNew( confSet );
	       debug( "while.confSet.2=", confSet, " s0=", state[ 0 ], " step=", step );
	       
	       if( step >= 0 ) {
		  debug( ">>> predict state=", state );
		  predict( state, stateNum, confSet, conf, step, starters, enders ); 
		  debug( "<<< predict state=", state );
	       } else {
		  const preds = predictors[ step + nbNts ];
		  debug( "preds=", preds );
		  reduce( states, state, stateNum, confSet, head, preds );
	       }
	    } else {
	       break;
	    }
	 }
      }
      
      function forward( starters, enders, predictors, steps, nts, toks ) {
	 const nbToks = toks.length;
	 const nbConfs = steps.length;
	 const states = makeStates( nbToks, nbConfs );
	 const goalStarters = starters[ 0 ];
	 
	 debug( "forward nts=", nbToks, " ", nbConfs );
	 confSetAdjoinStar( states, 0, goalStarters, 0 );
	 forw( states, 0, starters, enders, predictors, steps, nts );
	 
	 for( let i = 0; i < nbToks; i++ ) {
	    const tokNts = cdr( toks[ i ] );
	    confSetAdjoinStar( states, i + 1, tokNts, i );
	    forw( states, i + 1, starters, enders, predictors, steps, nts );
	 }
	 
	 return states;
      }
      
      function produce( conf, i, j, enders, steps, toks, states, statesStar, nbNts ) {
	 debug( "produce ", conf, " ", i, " ", j, " ", nbNts );
	 const prev = conf - 1;
	 
	 if( conf >= nbNts && steps[ prev ] >= 0 ) {
	    function loop1( l ) {
	       if( pairp( l ) ) {
		  const ender = car( l );
		  const enderSet = confSetGet( states[ j ], ender );
		  
		  if( enderSet ) {
		     function loop2( k ) {
			if( k >= 0 ) {
			   if( k >= i ) {
			      if( confSetAdjoinStarStar( states, statesStar, k, prev, i ) ) {
				 confSetAdjoinStarStar( states, statesStar, j, ender, k );
			      }
			   }
			   return loop2( confSetNext( enderSet, k ) );
			} else {
			   return loop1( cdr( l ) );
			}
		     }
		     
		     return loop2( confSetHead( enderSet ) );
		  } else {
		     return loop1( cdr( l ) );
		  }
	       }
	    }
	    
	    return loop1( enders[ steps[ prev ] ] );
	 }
      }
      
      function back( states, statesStar, stateNum, enders, steps, nbNts, toks ) {
	 const stateStar = statesStar[ stateNum ];
	 debug( "back ", stateNum, " ", stateStar );
	 
	 function loop1() {
	    const conf = stateStar[ 0 ];
	    debug( "back.1 conf=", conf);
	    if( conf >= 0 ) {
	       const confSet = stateStar[ conf + 1 ];
	       const head = confSet[ 4 ];
	       debug( "back.2 confSet=", confSet, " head=", head );
	       
	       stateStar[ 0 ] = confSet[ 0 ];
	       confSetMergeNew( confSet );
	       
	       for( let i = head; i >= 0; i = confSetNext( confSet, i ) ) {
		  produce( conf, i, stateNum, enders, steps, 
		     toks, states, statesStar, nbNts );
	       }
	       return loop1();
	    }
	 }
	 
	 return loop1();
      }
      
      function backward( states, enders, steps, tks, toks ) {
	 const nbToks = toks.length;
	 const nbConfs = steps.length;
	 const nbNts = nts.length;
	 const statesStar = makeStates( nbToks, nbConfs );
	 const goalEnders = enders[ 0 ];

	 debug( "backward ", nbToks, " ", nbConfs, " ", nbNts );
	 for( let l = goalEnders; pairp( l ); l = cdr( l ) ) {
	    const conf = car( l );
	    debug( "backward.1 ", length( l ), " ", conf);
	    confSetAdjoinStarStar( states, statesStar, nbToks, conf, 0 );
	 }
	 
	 for( let i = nbToks; i >= 0; i-- ) {
	    debug( "backward.2 ", nbToks, " ", i );
	    back( states, statesStar, i, enders, steps, nbNts, toks );
	 }
	 
	 return statesStar;
      }
      
      function parsedp( nt, i, j, nts, enders, states ) {
	 debug( "parsed? ", i, " ", j );
	 const ntStar = index( nt, nts );
	 
	 if( ntStar ) {
	    const nbNts = nts.length;
	    
	    for( let l = enders[ ntStar ]; pairp( l ); l = cdr( l ) ) {
	       const conf = car( l );
	       if( confSetMemberp( states[ j ], conf, i ) ) {
		  return true;
	       } 
	    }
	    return false;
	 } else {
	    return false;
	 }
      }
      
      function derivTrees( conf, i, j, enders, steps, names, toks, states, nbNts ) {
	 debug( "derivTrees conf=", conf, " ", i, " ", j, " names=", names );
	 const name = names[ conf ];
	 debug( "derivTrees name=", name );
	 
	 if( name ) {
	    if( conf < nbNts ) {
	       return list( list( name, car( toks[ i ] ) ) );
	    } else {
	       return list( list( name ) );
	    }
	 } else {
	    const prev = conf - 1;
	    
	    function loop1( l1, l2 ) {
	       debug( "derivTree.loop1 l1=", l1, " l2=", l2 );

	       if( pairp( l1 ) ) {
		  const ender = car( l1 );
		  const enderSet = confSetGet( states[ j ], ender );
		  debug( "derivTrees ender=", ender, " es=", enderSet);
		  if( enderSet ) {
		     function loop2( k, l2 ) {
			debug( "derivTrees.loop2 k=", k, " l2=", l2 );
			if( k >= 0 ) {
			   if( k >= i && confSetMemberp( states[ k ], prev, i ) ) {
			      const prevTrees =
				 derivTrees( prev, i, k, enders, steps, names,
				    toks, states, nbNts );
			      const enderTrees = 
				 derivTrees( ender, k, j, enders, steps, names,
				    toks, states, nbNts );
			      
			      function loop3( l3, l2 ) {
				 if( pairp( l3 ) ) {
				    const enderTree = list( car( l3 ) );
				    function loop4( l4, l2 ) {
				       debug( "loop4 l4=", l4, " l2=", l2 );
				       if( pairp( l4 ) ) {
					  debug( "loop4.cdr=", cdr( l4 ), " ", 
					     listp( enderTree ) );
					  return loop4( cdr( l4 ), 
					     cons( append( car( l4 ), enderTree ), l2 ) );
				       } else {
					  return loop3( cdr( l3 ), l2 );
				       }
				    }
				    
				    debug( ">>> loop4 ", prevTrees, " ", listp( prevTrees ) );
				    return loop4( prevTrees, l2 );
				 } else {
				    return loop2( confSetNext( enderSet, k ), l2 );
				 }
			      }
			      
			      return loop3( enderTrees, l2 );
			   } else {
			      return loop2( confSetNext( enderSet, k ), l2 );
			   }
			} else {
			   return loop1( cdr( l1 ), l2 );
			}
		     }
		     
		     return loop2( confSetHead( enderSet ), l2 );
		  } else {
		     return loop1( cdr( l1 ), l2 );
		  }
	       } else {
		  return l2;
	       }
	    }
	    debug( "derive.loop1.0 steps=", steps, " enders=", enders, " prev=", prev );
	    return loop1( enders[ steps[ prev ] ], null );
	 }
      }
      
      function derivTreesStar( nt, i, j, nts, enders, steps, names, toks, states ) {
	 const ntStar = index( nt, nts );
	 
	 debug( "derivTreesStar ", ntStar, " ", j, " ", states, " ", names );
	 if( ntStar !== false ) {
	    const nbNts = nts.length;
	    debug( "derivTreesStar.2 nbNts=", nbNts, " ", enders[ ntStar ] );
	    
	    function loop( l, trees ) {
	       debug( "derivTreesStar.3 ", trees, " ", length( l), " ", length( trees ));
	       if( pairp( l ) ) {
		  const conf = car( l );
		  debug( "derivTreesStar.4 ", conf );
		  debug( "derivTreesStar.5 j=", j, " ", states.length );
		  if( confSetMemberp( states[ j ], conf, i ) ) {
		     return loop( cdr( l ),
			append( derivTrees( conf, i, j, enders, steps, names,
				   toks, states, nbNts ),
			   trees ) );
		  } else {
		     return loop( cdr( l ), trees );
		  }
	       } else {
		  return trees;
	       }
	    }
	    
	    return loop( enders[ ntStar ], nil );
	 } else {
	    return false;
	 }
      }

      function nbDerivTrees( conf, i, j, enders, steps, toks, states, nbNts ) {
	 const prev = conf - 1;
	 
	 if( conf < nbNts || steps[ prev ] < 0 ) {
	    return 1;
	 } else {
	    function loop1( l, n ) {
	       if( pairp( l ) ) {
		  const ender = car( l );
		  const enderSet = confSetGet( states[ j ], ender );
		  
		  if( enderSet ) {
		     function loopII( k, n ) {
			if( k >= 0 ) {
			   if( k >= i && confSetMemberp( states[ k ], prev, i ) ) {
			      const nbPrevTrees = 
				 nbDerivTrees( prev, i, k, enders, steps, 
				    toks, states, nbNts );
			      const nbEnderTrees = 
				 nbDerivTrees( ender, k, j, enders, steps,
				    toks, states, nbNts );
			      
			      return loopII( confSetNext( enderSet, k ),
				 n + (nvPrevTrees * nvEnderTrees) );
			   } else {
			      return loopII( confSetNext( enderSet( k ), n ) );
			   }
			} else {
			   return loop1( cdr( l ), n );
			}
		     }
		     
		     return loopII( confSetHead( enderSet, n ) );
		  } else {
		     return loop1( cdr( l ), n );
		  }
	       }
	    }
	    
	    return loop1( enders[ stesp[ prev ] ], 0 );
	 }
      }
      
      function nbDerivTreesStar( nt, i, j, nts, enders, steps, toks, states ) {
	 const ntStar = index( nt, nts );
	 if( ntStar ) {
	    const nbNts = nts.length;
	    
	    function loop( l, ntTres ) {
	       if( pairp( l ) ) {
		  const conf = car( l );
		  
		  if( confSetMemberp( states[ j ], conf, i ) ) {
		     return loop( cdr( l ), 
			nvDerivTres( conf, i, j, enders, steps, toks, states,
			   nbNts ) + nbTrees );
		  } else {
		     return loop( cdr( l ), nbTrees );
		  }
	       } else {
		  return nbTrees;
	       }
	    }

	    return loop( enders[ ntStar ], 0 );
	 } else {
	    return false;
	 }
      }
      
      const toks = inputToTokens( input, parserDescr.lexer, parserDescr.nts );
      debug( "toks=", toks);
      return {
	 nts: parserDescr.nts,
	 starters: parserDescr.starters,
	 enders: parserDescr.enders,
	 predictors: parserDescr.predictors,
	 steps: parserDescr.steps,
	 names: parserDescr.names,
	 toks: toks,
	 states: backward( forward( parserDescr.starters, 
			      parserDescr.enders,
			      parserDescr.predictors,
			      parserDescr.steps,
			      parserDescr.nts,
			      toks ),
	    parserDescr.enders,
	    parserDescr.steps,
	    parserDescr.nts,
	    toks ),
	 parsedp: parsedp,
	 derivTreesStar: derivTreesStar,
	 nbDerivTreesStar: nbDerivTreesStar
      }
   };
   console.log( parse.size );
   return parse;
}

function parseToTrees( parse, nt, i, j ) {
   return parse.derivTreesStar( nt, i, j, 
      parse.nts, parse.enders, parse.steps, parse.names, parse.toks, parse.states );
}

function test() {
   const p = makeParser( list( list( "s", list( "a"), list( "s", "s"))),
      l => l.map( x => list( x, x ) ) );
   const x = p( list( "a", "a", "a", "a", "a", "a", "a", "a", "a" ) );
   const t = parseToTrees( x, "s", 0, 9 );
   debug( "test t=", t );
   return length( t );
}
	    
console.log( "test=", test() );      
