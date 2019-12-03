/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/bglstone/leval.js               */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Tue Dec  3 13:33:13 2019                          */
/*    Last change :  Tue Dec  3 16:03:49 2019 (serrano)                */
/*    Copyright   :  2019 Manuel Serrano                               */
/*    -------------------------------------------------------------    */
/*    Feeley's Scheme Lambda interpreter                               */
/*=====================================================================*/
"use strict";

/*---------------------------------------------------------------------*/
/*    ewal ...                                                         */
/*---------------------------------------------------------------------*/
function ewal( exp, env ) {
   env.foreach( x => compDefine( car( x ), cdr( x ) )( env ) );
   return meaning( comp( exp, nil, false ), env );
}

function meaning( cx, env ) {
   return cx( env );
}

/*---------------------------------------------------------------------*/
/*    globalEnv ...                                                    */
/*---------------------------------------------------------------------*/
function globalEnv() {
   let env = cons( cons( false, (env) => false ), nil );

   env = cons( cons( "+", (env, x, y) => x + y), env );
   env = cons( cons( "-", (env, x, y) => x - y), env );
   env = cons( cons( "<", (env, x, y) => x < y), env );
   env = cons( cons( ">=", (env, x, y) => x >= y), env );
   
   return env;
}

/*---------------------------------------------------------------------*/
/*    pair ...                                                         */
/*---------------------------------------------------------------------*/
function pair( car, cdr ) {
   this.car = car;
   this.cdr = cdr;
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
      } else {
	 proc( car( l ) );
	 return loop( cdr( l ) );
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

function list() {
   function loop( v, i ) {
      if( i === v.length ) {
	 return nil;
      } else {
	 return cons( v[ i ], loop( v, i + 1 ) );
      }
   }
   
   return loop( arguments, 0 );
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
/*    comp ...                                                         */
/*---------------------------------------------------------------------*/
function comp( x, env ) {
   if( !(x instanceof pair) ) {
      const atom = x;
      if( typeof x === "string" ) {
	 return compRef( variable( atom, env ) );
      } else {
	 return compCnst( atom );
      }
   } else if( car( x ) === "quote" ) {
      return compCnst( cadr( x ) );
   } else if( car( x ) === "if" ) {
      return compIf( 
	 comp( cadr( x ), env, false ),
	 comp( caddr( x ), env ),
	 comp( cadddr( x ), env ) );
   } else if( car( x ) === "begin" ) {
      return compBegin( cdr( x ), env );
   } else if( car( x ) === "define" ) {
      return compDefine( cadr( x ), comp( caddr( x ), nil, false ) );
   } else if( car( x ) === "set!" ) {
      return compSet( 
	 variable( cadr( x ), env ), 
	 comp( caddr( x ), env, false ) );
   } else if( car( x ) === "lambda" ) {
      const formals = cadr( x );
      const body = caddr( x );
      return compLambda( 
	 formals, 
	 comp( body, extendEnv( formals, env ), true),
	 true );
   } else {
      const fun = car( x );
      const args = cdr( x );
      const actuals = args.map( a => comp( a, env, false ) );
      const proc = comp( fun, env, false );
      return compApply( proc, actuals );
   }
}

/*---------------------------------------------------------------------*/
/*    variable ...                                                     */
/*---------------------------------------------------------------------*/
function variable( symbol, env ) {
   function loop( env, count ) {
      if( env === nil ) {
	 return false;
      } else if( car( env ) === symbol ) {
	 return count;
      } else
	return loop( cdr( env ), count + 1 );
   }
   
   const offset = loop( env, 0 );
   
   if( offset ) {
      return offset;
   } else {
      return env.assq( symbol );
   }
}

/*---------------------------------------------------------------------*/
/*    globalp ...                                                      */
/*---------------------------------------------------------------------*/
function globalp( variable ) {
   return variable instanceof pair;
}

/*---------------------------------------------------------------------*/
/*    compRef ...                                                      */
/*---------------------------------------------------------------------*/
function compRef( variable ) {
   if( globalp( variable ) ) {
      return env => cdr( variable );
   } else {
      switch( variable ) {
	 case 0: return env => car( env );
	 case 1: return env => cadr( env );
	 case 2: return env => caddr( env );
	 case 3: return env => cadddr( env );
	 default: return env => listRef( env, variable );
      }
   }
}

/*---------------------------------------------------------------------*/
/*    compSet ...                                                      */
/*---------------------------------------------------------------------*/
function compSet( variable, value ) {
   if( globalp( variable ) ) {
      return env => update( variable, value, env );
   } else {
      switch( variable ) {
	 case 0: return env => setCar( env, value( env ) );
	 case 1: return env => setCar( cdr( env ), value( env ) );
	 case 2: return env => setCar( cddr( env ), value( env ) );
	 case 3: return env => setCar( cdddr( env ), value( env ) );
	 default: return env => listSet( env, variable, value( env ) );
      }
   }
}

/*---------------------------------------------------------------------*/
/*    compCnst ...                                                     */
/*---------------------------------------------------------------------*/
function compCnst( cnst ) {
   return env => cnst;
}

/*---------------------------------------------------------------------*/
/*    compIf ...                                                       */
/*---------------------------------------------------------------------*/
function compIf( test, then, otherwise ) {
   return env => test( env ) ? then( env ) : otherwise( env );
}
      
/*---------------------------------------------------------------------*/
/*    compBegin ...                                                    */
/*---------------------------------------------------------------------*/
function compBegin( body, env ) {
   if( pairp( body ) && nullp( cdr( body ) ) ) {
      const rest = comp( car( body ), env );
      return env => rest( env );
   } else {
      function loop( rest ) {
	 if( nullp( (cdr( rest ) ) ) ) {
	    return cons( comp( car( rest ), env ), nil );
	 } else {
	    return cons( comp( car( rest ), env ), loop( cdr( rest ) ) );
	 }
      }
      
      return env => {
	 function _loop_( body ) {
	    if( nullp( cdr( body ) ) ) {
	       return car( body )( env );
	    } else {
	       car( body )( env );
	       return _loop_( cdr( body ) );
	    }
	 }
      }
   }
}

/*---------------------------------------------------------------------*/
/*    compDefine ...                                                   */
/*---------------------------------------------------------------------*/
function compDefine( v, val ) {
   return env => {
      const cell = env.assq( v );
      console.log( "def v=", v, " val=", val );
      
      if( pairp( cell ) ) {
	 return update( cell, val, env );
	 
      } else {
	 setCdr( env, cons( car( env ), cdr( env ) ) );
	 setCar( env, cons( v, val( env ) ) );
	 return v;
      }
   }
}

/*---------------------------------------------------------------------*/
/*    update ...                                                       */
/*---------------------------------------------------------------------*/
function update( v, val, env ) {
   console.log( "v=", v, " val=", val );
   setCdr( v, val( env ) );
   return car( v );
}

/*---------------------------------------------------------------------*/
/*    extendEnv ...                                                    */
/*---------------------------------------------------------------------*/
function extendEnv( extend, oldEnv ) {
   function _loop_( extend ) {
      if( nullp( extend ) ) {
	 return oldEnv;
      } else if( !pairp( extend ) ) {
	 return cons( extend, oldEnv );
      } else {
	 return cons( car( extend ), _loop_( cdr( extend ) ) );
      } 
   }
   
   return _loop_( extend );
}
     
/*---------------------------------------------------------------------*/
/*    compLambda ...                                                   */
/*---------------------------------------------------------------------*/
function compLambda( formals, body ) {
   switch( length( formals ) ) {
      case 0: 
	 return env => () => body( env );
      case 1: 
	 return env => (x) => body( cons( x, env ) );
      case 2: 
	 return env => (x, y) => body( cons( x, cons( y, env ) ) );
      case 3: 
	 return env => (x, y, z) => body( cons( x, cons( y, cons( z, env ) ) ) );
      case 4: 
	 return env => (x, y, z, t) => body( cons( x, cons( y, cons( z, cons( t, env ) ) ) ) );
      default:
	 return env => { throw( "not supported" ) };
   } 
}

/*---------------------------------------------------------------------*/
/*    compApply ...                                                    */
/*---------------------------------------------------------------------*/
function compApply( proc, actuals ) {
   switch( length( actuals ) ) {
      case 0:
	 return env => proc( env );
      case 1:
	 return env => proc( env, 
	    car( actuals )( env ) );
      case 2:
	 return env => proc( env, 
	    car( actuals )( env ),
	    cadr( actuals )( env ) );
      case 3:
	 return env => proc( env, 
	    car( actuals )( env ),
	    cadr( actuals )( env ),
	    caddr( actuals )( env ) );
      case 4:
	 return env => proc( env, 
	    car( actuals )( env ),
	    cadr( actuals )( env ),
	    caddr( actuals )( env ),
	    cadddr( actuals )( env ) );
      default:
	 return env => { throw( "not supported" ) };
   }
}

/*---------------------------------------------------------------------*/
/*    tak ...                                                          */
/*---------------------------------------------------------------------*/
const tak = list( "define", "tak", 
   list( "lambda", 
      list( "x", "y", "z" ),
      list( "if", 
	 list( ">=", "y", "x" ),
	 "z",
	 list( "tak", 
	    list( "tak", list( "-", "x", "1"), "y", "z"),
	    list( "tak", list( "-", "y", "1"), "z", "x"),
	    list( "tak", list( "-", "z", "1"), "x", "y") ) ) ) );
const takcall = list( "tak", 20, 10, 3 );

/*---------------------------------------------------------------------*/
/*    run ...                                                          */
/*---------------------------------------------------------------------*/
function run( num ) {
   let r = 0;
   let env = globalEnv();

   for( let i = 0; i < num; i++ ) {
      ewal( tak, env );
      r = ewal( takcall, env );
   }
   
   return r;
}

console.log( run( 1 ) );
