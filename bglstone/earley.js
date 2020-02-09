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

pair.prototype.toArray = function() {
   var a = new Array();
   
   this.foreach( e => a.push );
   return a.reverse();
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

function length( l ) {
   if( nullp( l ) ) {
      return 0;
   } else {
      return 1 + length( cdr( l ) );
   }
}

/*---------------------------------------------------------------------*/
/*    earley                                                           */
/*---------------------------------------------------------------------*/
function makeParser( grammar, lexer ) {
   
   function nonTerminals( grammar ) {
      
      function addNt( nt, nts) {
	 if( member( nt, nts ) ) {
	    return nts;
	 } else {
	    return Cons( nt, nts );
	 }
      }
      
      function defLoop( defs, nts ) {
	 if( pairp( defs ) ) {
	    let def = car( defs );
	    let head = car( defs );
	    
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
	 } else {
	    return listToVector( reverse( nts ) );
	 }
      }
      
      return defLoop( grammar, nil );
   }

   function index( nt, nts ) {
      for( let i = nts.length - 1; i >= 0; i-- ) {
	 if( equal( nts[ i ], nt ) ) {
	    return i;
	 }
      }
      return false;
   }
   
   function nbConfigurations( grammar ) {
      
      function defLoop( defs, nbConfs ) {
	 if( pairp( defs ) ) {
	    let def = car( defs );
	    
	    function ruleLoop( rules, nbConfs ) {
	       if( pairp( rules ) ) {
		  let rule = car( rules );
		  
		  for( let let l = rule;
  		       pairp( l ); 
		       l = cdr( l ), nbConfs++ );
		     
		     return ruleLoop( cdr( rules ), nbConfs + 1 );
	       } else {
		  return defLoop( cdr( defs ), nbConfs );
	       }
	    }
	 } else {
	    return nbConfs;
	 }
      }
      
      return defLoop( grammar, 0 );
   }
   
   let nts = nonTerminals( grammar );
   let nbNts = nts.length;
   let nbConfs = nbConfigurations( grammar ) + nbNts;
   let starters = new Array( nbNts );
   let enders = new Array( nbNts );
   let predictors = new Array( nbNts );
   let steps = new Array( nbConfs );
   let names = new Array( nbConfs );
   
   starters.fill( nil );
   enders.fill( nil );
   predictors.fill( nil );
   setps.fill( false );
   names.fill( false );
   
   function setupTables( grammar, nts, starters, enders, predictors, steps, names ) {
      function addConf( conf, nt, nts, klass ) {
	 let i = index( nt, nts );
	 klazz[ i ] = cons( conf, klazz[ i ] );
      }
      
      let nbNts = nts.length;
      
      for( let i = nbNts - 1; i >=0; i-- ) {
	 steps[ i ] = i - nbNts;
	 names[ i ] = list( nts[ i ], 0 );
	 enders[ i ] = list( i );
      }
      
      function defLoop( defs, conf ) {
	 if( pairp( defs ) ) {
	    let def = car( defs );
	    let head = car( def );
	    
	    function ruleLoop( rules, conf, ruleNum ) {
	       if( pairp( rules ) ) {
		  names[ conf ] = list( head, ruleNum );
		  addConf( conf, head, nts, starters );
		  
		  function loop( l, conf ) {
		     if( pairp( l ) ) {
			let nt = car( l );
			steps[ conf ] = index( nt, nts );
			addConf( conf, nts, predictors );
			return loop( cdr( l ), conf + 1 );
		     } else {
			steps[ conf ] = index( head, nts ) - ntNts;
			addConf( conf, head, nts, enders );
			return ruleLoop( cdr( rules ), conf + 1, ruleNum + 1 );
		     }
		  }
		  
		  return loop( rule, conf );
	       }
	       
	       return ruleLoop( cdr( def ), conf, 1 );
      	    }
      	    
      	    return defLoop( grammar, nts.length );
   	 }
      }
      
      setupTables( grammar, nts, starters, enders, predictors, steps, names );
      
      const parserDescr = 
	 [ lexer, nts, starters, enders, predictors, steps, names ];
      
      function( input ) {
	 
	 function index( nt, nts ) {
	    for( let i = nts.length - 1; i >= 0; i-- ) {
	       if( nts[ i ] == nt ) {
		  return i;
	       } 
	    }
	    return false;
	 }
	 
	 function compTok( tok, nts ) {
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
	    return lexer.input.toArray.map( tok => compTok( tok, nts ) );
	 }
	 
	 function makeStates( nbToks, nbConfs ) {
	    const states = new Array[ nbToks, 1 ];
	    states.fill( false );
	    
	    for( let i = nbToks; i >= 0; i-- ) {
	       const v = new Array[ nbConfs + 1 ];
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
	    const confSet = confSetGet( state, conf );
	    
	    if( confSet ) {
	       return confSet;
	    } else {
	       const res = new Array[ stateName + 6 ];
	       res.fill( false );
	       res[ 1 ] = -3;
	       res[ 2 ] = -1;
	       res[ 3 ] = -1;
	       res[ 4 ] = -1;
	       
	       state[ conf + 1 ] = res;
	       
	       return res;
	    }
	 }
	 
	 function getSetMergeNew( confSet ) {
	    confSet( [ confSet[ 1 ] + 5 ], confSet[ 4 ] );
	    confSet[ 1 ] = confSet[ 3 ];
	    confSet[ 3 ] = -1;
	    confSet[ 4 ] = -1;
	 }
	 
	 function confSetHead( confSet ) {
	    return confSet[ 2 ];
	 }
	 
	 function confSetNext( confSet, i ) {
	    return confSet[ i + 5 ];
	 }
	 
	 function confSetAdjoin( state, confSet, conf, i ) {
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
	    const state = states[ stateName ];
	    for( l1 = l; pairp( l1 ); l1 = cdr( l1 ) ) {
	       const conf = car( l1 );
	       const confSet = confSetGetStar( state, stateNum, conf );
	       if( !confSetNext( confSet, i ) ) {
		  confSetAdjoin( state, confSet, conf, i );
	       }
	    }
	 }
	 
	 function confSetAdjoinStarStar( states, statesStar, stateNum, conf, i ) {
	    const state = states[ stateNum ];
	    if( confSetMemberp( state, conf, i ) ) {
	       const stateStar = statesStar[ stateNun ];
	       const confSetStar = confSetGetStart( stateStar, stateNum, conf );
	       
	       if( !confSetNext( confSetStar,i ) ) {
		  confSetAdjoin( stateStar, confSetStar, conf, i );
	       }
	       return true;
	    } else {
	       return false;
	    }
	 }
	 
	 function confSetUnion( state, confSet, conf, otherSet ) {
	    for( let i = confSetHead( otherSet ); 
	    i >= 0; 
	    i = confSetNext( otherSet, i ) ) {
	       if( !confSetNext( confSet, i ) ) {
		  confSetAdjoin( state, confSet, conf, i );
	       }
	    }
	 }
	 
	 function forw( states, stateNum, starters, enders, predictors, steps, nts ) {
	    function predict( state, stateNum, confSet, conf, nt, starters, enders ) {
	       for( let l = starters[ nt ]; pairp( l ); l = cdr( l ) ) {
		  const starter = car( l );
		  const startSet = confSetGetStar( state, stateNum, starter );
		  
		  if( !confSetNext( starterSet, starter, stateNum ) ) {
		     confSetAdjoin( state, starterSet, starter, stateNum );
	       	  }
	       }
	       
	       for( let l = enders[ nt ]; pairp( l ); l = cdr( l ) ) {
		  const ender = car( l );
		  if( confSetMemberp( state, ender, stateNum ) ) {
		     const next = conf + 1;
		     const nextSet = confSetGetStar( state, stateNum, next );
		     confSetUnion( state, nextSet, next, confSet );
		  }
	       }
	    }
 	    
	    function reduce( states, state, stateNum, confSet, head, preds ) {
	       function loop1( l ) {
		  if( pairp( l ) ) {
		     const pred = car( l );
		     
		     function loop2( i ) {
			if( i >= 0 ) {
			   const predSet = confSetGet( states[ i ], pred );
			   if( predSet ) {
			      const next = pred + 1;
			      const nextSet = confSetGetStar( state, stateNum, next );
			      confSetUnion( state, nextSet, next, predSet );
			   } 
			   return loop2( confSetNext( confSet, i ) );
			} else 
			  return loop1( cdr( l ) );
		     }
		     
		     return loop2( head );
		  }
	       }
	       
	       return loop1( preds );
	    }
	      
	    const state = states[ stateNum ];
	    const nbNts  nts.length;
	    
	    while( true ) {
	       const conf = state[ 0 ];
	       if( conf >= 0 ) {
		  const state = steps[ conf ];
		  const confSet = state[ conf + 1 ];
		  const head = confSet[ 4 ];
		  
		  state[ 0 ] = confSet[ 0 ];
		  confSetMergeNew( confSet );
		  
		  if( step >= 0 ) {
		     predict( state, stateNum, confSet, conf, step, starters, enders ); 
		  } else {
		     const preds = predictors[ step + nbNts ];
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
	    const states = makeStates[ ntToks, nbConfs ];
	    const goalStarts = starters[ 0 ];
	    
	    confSetAdjoinStar( states, 0, goalStarters, 0 );
	    forw( states, 0, starters, enders, predictors, steps, nts );
	    
	    for( let i = 0; i < nbToks, i++ ) {
	       const tokNts = cdr( toks[ i ] );
	       congSetAdjoinStar( states, i + 1, tokNts, i );
	       forws( states, i + 1, starters, enders, predictors, steps, nts );
	    }
	    
	    return states;
	 }
	 
	 function produce( conf, i, j, enders, steps, toks, states, statesStar, nbNts ) {
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
	    
	    
	       
	 
	 
	       
	       
