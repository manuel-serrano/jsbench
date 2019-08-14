/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/ratio.js          */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Mon Aug 12 10:15:42 2019                          */
/*    Last change :  Wed Aug 14 15:39:20 2019 (serrano)                */
/*    Copyright   :  2019 Manuel Serrano                               */
/*    -------------------------------------------------------------    */
/*    Generate a new log file that is the ratio of two log files.      */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );
const format = require( "util" ).format;
const common = require( "../common.js" );
const utils = require( "./utils.js" );

/*---------------------------------------------------------------------*/
/*    collectEngines ...                                               */
/*---------------------------------------------------------------------*/
function collectEngines( logs ) {
   const enames = [];

   logs.forEach( log => {
      log.engines.forEach( e => {
	 if( enames.indexOf( e.name ) < 0 ) { enames.push( e.name ) };
      } );
   } );

   return enames;
}

/*---------------------------------------------------------------------*/
/*    ratioEngine ...                                                  */
/*---------------------------------------------------------------------*/
function ratioEngine( e, log0, log1 ) {
   const e0 = log0.engines.find( f => f.name === e.name );
   const e1 = log1.engines.find( f => f.name === e.name );
   const l0 = e0.logs;
   const l1 = e1.logs;
   const l = [];
   
   for( let i in l0 ) {
      l0[ i ].time = l0[ i ].time / l1[ i ].time;
      
      for( let j in l0[ i ].times.ustimes ) {
	 l0[ i ].times.ustimes[ j ] = l0[ i ].times.ustimes[ j ] / l1[ i ].times.ustimes[ j ];
      }
      
      for( let j in l0[ i ].times.rtimes ) {
	 l0[ i ].times.rtimes[ j ] = l0[ i ].times.rtimes[ j ] / l1[ i ].times.rtimes[ j ];
      }
   }
}   
   
/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args ) {
   const logs0 = require( common.normalizeCwd( logfiles[ 0 ] ) );
   const logs1 = require( common.normalizeCwd( logfiles[ 1 ] ) );
   
   for( let i in logs0 ) {
      const log0 = logs0[ i ];
      const log1 = logs1[ i ];
      
      log0.engines.forEach( e => ratioEngine( e, log0, log1 ) );
   }
   
   console.log( JSON.stringify( logs0 ) );
}

