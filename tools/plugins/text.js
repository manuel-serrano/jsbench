/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/text.js           */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 10:21:57 2017                          */
/*    Last change :  Thu Oct 24 09:23:56 2019 (serrano)                */
/*    Copyright   :  2017-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    text plugin                                                      */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );
const format = require( "util" ).format;
const common = require( "../common.js" );

/*---------------------------------------------------------------------*/
/*    compatibility                                                    */
/*---------------------------------------------------------------------*/
if( !("isAbsolute" in path) ) {
   path.isAbsolute = function( p ) {
      return p[ 0 ] == '/';
   }
}
      
/*---------------------------------------------------------------------*/
/*    padding ...                                                      */
/*---------------------------------------------------------------------*/
function padding( str, pad ) {
   let diff = (pad - str.length);
   let res = ""
   let i = 0;
   
   for( ; i < diff/2; i++ ) {
      res += " ";
   }

   res += str;
   
   for( ; i < diff; i++ ) {
      res += " ";
   }

   return res;
}

/*---------------------------------------------------------------------*/
/*    JSONdateToString ...                                             */
/*---------------------------------------------------------------------*/
function JSONdateToString( jsondate ) {
   
   function pad( number ) {
      if( number < 10 ) {
         return '0' + number;
      }
      return number;
   }

   const dt = new Date( Date.parse( jsondate ) );
   
   return dt.getFullYear()
      + "-" + pad( dt.getMonth() + 1 ) + "-"
      + pad( dt.getDate() ) + ":"
      + pad( dt.getHours() ) + "h" + pad( dt.getMinutes() );
}
   
/*---------------------------------------------------------------------*/
/*    mean ...                                                         */
/*---------------------------------------------------------------------*/
function mean( times ) {
   let res = 0;
   
   for( let i = times.length - 1; i >= 0; i-- ) {
      res += times[ i ];
   }
   
   return Math.round( res / times.length );
}

/*---------------------------------------------------------------------*/
/*    logText ...                                                      */
/*---------------------------------------------------------------------*/
function logText( logs, enames ) {
   logs.forEach( log => {
      let len = 0;
      let engines = log.engines.filter( e => enames.indexOf( e.name ) != -1 );
      
      engines.forEach( e => {
	 if( e.name.length > len )
	    len = e.name.length;
	 if( e.host.length > len )
	    len = e.host.length;
	 if( e.version && (e.version.length + 2) > len )
	    len = 2 +  e.version.length;
      } );

      len += 6;

      // test name
      process.stdout.write( log.name );
      process.stdout.write( "\n" );
      for( let i = 0; i < log.name.length; i++ ) {
	 process.stdout.write( "=" );
      }
      process.stdout.write( "\n\n" );

      // engine line
      for( let i = 0; i < engines.length * len; i++ ) {
	 process.stdout.write( "-" );
      };
      process.stdout.write( "\n" );
      engines.forEach( e => {
	 process.stdout.write( padding( e.name, len ) )
      } )
      process.stdout.write( "\n" );
      engines.forEach( e => {
	 if( e.version ) {
	    process.stdout.write( padding( "(" + e.version + ")", len ) );
	 } else {
	    process.stdout.write( padding( "  ", len ) );
	 }
      } )
      process.stdout.write( "\n" );
      engines.forEach( e => {
	 process.stdout.write( padding( e.host, len ) )
      } )
      process.stdout.write( "\n" );
      for( let i = 0; i < engines.length * len; i++ ) {
	 process.stdout.write( "-" );
      };
      process.stdout.write( "\n" );

      // value lines
      for( let stamp = 0; true; stamp++ ) {
	 let k;

	 if( engines.find( e => e.logs.find( l => l.stamp == stamp ) ) ) {
	 
	    engines.forEach( e => {
	       let l = e.logs.find( l => l.stamp == stamp );
	       
	       if( l && l.times.rtimes ) {
		  if( l.times.rtimes ) {
		     if( !k ) k = l;
		     
		     process.stdout.write( padding( "" + (mean( l.times.rtimes ) / 1000).toFixed( 2 ) + " real", len ) );
		  } else {
		     process.stdout.write( padding( "_ real", len ) );
		  }
	       } else {
		  process.stdout.write( padding( "real", len ) );
	       }
/* 	       if( l && l.time ) {                                     */
/* 		  if( l.time ) {                                       */
/* 		     if( !k ) k = l;                                   */
/* 		                                                       */
/* 		     process.stdout.write( padding( "" + l.time / 1000 + " usr+sys", len ) ); */
/* 		  } else {                                             */
/* 		     process.stdout.write( padding( "_ usr+sys", len ) ); */
/* 		  }                                                    */
/* 	       } else {                                                */
/* 		  process.stdout.write( padding( "usr+sys", len ) );   */
/* 	       }                                                       */
	    } );
	    
	    if( k ) {
	       if( k.date ) {
		  process.stdout.write( "  ;; " );

		  process.stdout.write( JSONdateToString( k.date ) );

		  if( k.message ) {
		     process.stdout.write( " " + k.message );
		  }
	       }
	    }
	    
	    process.stdout.write( "\n" );
	 }
	 
	 if( !engines.find( e => e.logs.find( l => l.stamp > stamp ) ) ) {
	    break;
	 }
      }
      
      process.stdout.write( "\n" );
      process.stdout.write( "\n" );

      
   } );
}

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args, config ) {
   let logs = common.mergeLogs( logfiles, args );
   let queue = [];
   
   if( engines.length == 0 ) {
      logs.forEach( log => {
	 log.engines.forEach( e => {
	    if( queue.indexOf( e.name ) == -1 ) {
	       engines.push( e );
	       queue.push( e.name );
	    }
	 } );
      } );
   }
      
   logText( logs, engines.map( e => e.name ) );
}


