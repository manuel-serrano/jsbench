/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/summary.js        */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 10:21:57 2017                          */
/*    Last change :  Thu Oct 17 08:45:50 2019 (serrano)                */
/*    Copyright   :  2017-19 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Summary plugin.                                                  */
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
/*    paddingr ...                                                     */
/*---------------------------------------------------------------------*/
function paddingr( str, pad ) {
   let diff = (pad - str.length);
   let res = ""
   let i = 0;
   
   for( ; i < diff; i++ ) {
      res += " ";
   }

   res += str;

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
/*    logText ...                                                      */
/*---------------------------------------------------------------------*/
function logText( logs, e ) {
   // engine name
   let en = e.name + " " + "(" + e.version + ") ";
   let stamp = -1, date;
   let host;

   // find the last stamp
   logs.forEach( log => {
      let g = log.engines.find( g => g.name === e.name );
      if( g ) {
	 host = g.host;
	 g.logs.forEach( g => {
	    if( g.stamp > stamp ) {
	       stamp = g.stamp;
	       date = g.date;
	    }
	 } );
      }
   } );

   en = `${e.name} ${e.version} (${JSONdateToString( date )}) [${host}]`;
   process.stdout.write( en );
   process.stdout.write( "\n" );
   
   for( let i = 0; i < en.length; i++ ) {
      process.stdout.write( "=" );
   }
   process.stdout.write( "\n\n" );

   logs.forEach( log => {
      let g = log.engines.find( g => g.name === e.name );
      
      // value lines
      process.stdout.write( paddingr( log.name, 20 ) );
      process.stdout.write( ": " );

      if( !g ) {
	 process.stdout.write( "\n" );
      } else {
	 const l = g.logs[ g.logs.length - 1 ];
	 const real = Math.min.apply( null, l.times.rtimes );

	 process.stdout.write( paddingr( (real/1000).toFixed( 2 ), 5 ) );
	 process.stdout.write( " real " );
	 
	 process.stdout.write( paddingr( (l.time/1000).toFixed( 2 ), 6 ) );
	 process.stdout.write( " usr+sys\n" );
      }
   } );
      
   process.stdout.write( "\n" );
}

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args ) {
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
      
   engines.forEach( e => logText( logs, e ) );
}


