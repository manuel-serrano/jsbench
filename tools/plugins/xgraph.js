/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/xgraph.js         */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 10:21:57 2017                          */
/*    Last change :  Thu Oct 17 08:46:04 2019 (serrano)                */
/*    Copyright   :  2017-19 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    xgraph plugin                                                    */
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
/*    normalizeCwd ...                                                 */
/*---------------------------------------------------------------------*/
function normalizeCwd( file ) {
   if( path.isAbsolute( file ) ) {
      return file;
   } else {
      return path.join( process.cwd(), file );
   }
}

/*---------------------------------------------------------------------*/
/*    logXgraph ...                                                    */
/*---------------------------------------------------------------------*/
function logXgraph( logs, engines ) {
   logs.forEach( log => {
      let len = 0;
      
      log.engines.forEach( e => {
	 if( e.logs.length > len ) len = e.logs.length
      } );

      if( len > 0 ) {
	 console.log( "TitleText:", log.name, "\n" );

	 log.engines.forEach( e => {
	    if( engines.length === 0 || engines.indexOf( e.name ) >= 0 ) {
	       if( e.logs.length > 0 ) {
		  console.log( `"${e.name} ${e.version} (${e.host})"` );

		  for( let i = 0, tmp; i < len; i++ ) {
		     if( i < e.logs.length ) {
			console.log( i, e.logs[ i ].time / 1000 );
			tmp = e.logs[ i ].time / 1000;
		     } else {
			console.log( i, tmp );
		     }
		  }

		  console.log( "\n" );
	       }
	    } else {
	       console.error( `ignoring engine "${e.name}"` );
	    }
	 } );
      }
   } )
}

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args ) {
   const logs = common.mergeLogs( logfiles, args );
   logXgraph( logs, engines.map( e => e.name ) );
}


