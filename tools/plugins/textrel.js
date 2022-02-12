/*=====================================================================*/
/*    .../article/jsrecords/bench/jsbench/tools/plugins/textrel.js     */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:53:11 2017                          */
/*    Last change :  Sat Feb 12 19:02:25 2022 (serrano)                */
/*    Copyright   :  2017-22 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Generate a textual summary of the comparison of two engines      */
/*    -------------------------------------------------------------    */
/*    Created for the paper jsrecord, use as:                          */
/*       hop --no-server -- ./jsbench/tools/logbench.js textrel.js \   */
/*        basic-es2015.log.json chaos.log.json go.log.json \           */
/*        --format '\newcommand{%sScore}{%d}' \                        */
/*        -E $PWD/engines \                                            */
/*        -e hop -e hop.sealed                                         */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require( "path" );
const fs = require( "fs" );
const util = require( "util" );
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
/*    colors ...                                                       */
/*---------------------------------------------------------------------*/
const defaultColors = [ '#3264c8', '#d83812', '#fa9600', '#109318', '#960096' ];
const defaultBoxwidth = 0.9;
const defaultFont = "Verdana,18";
const unitRatio = 1000;

/*---------------------------------------------------------------------*/
/*    ports                                                            */
/*---------------------------------------------------------------------*/
const port = process.stdout;

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args, config ) {
   const alogs = logfiles.map( l => require( common.normalizeCwd( l ) ) );

   const logs = common.mergeLogs( logfiles, args );
   const enames = engines.length > 0
	 ? engines.map( e => e.name )
	 : collectEngines( logs );
   let enginepad = 6;
   const linestyle = args.lineStyle || 0;
   
   if( logs.length === 0 ) {
      throw TypeError( "no logs found" );
   }
   
   const title = args.t || args.title || 
      ((!"title" in args) ? logs[ 0 ].name : "");
   const format = args.format || args.f || '%f: %i'
   const output = args.o || args.output || (logs[ 0 ].name + "." + format);
   const base = output.replace( /.[^.]+$/, '' );
  
   enames.forEach( n => { if( n.length > enginepad ) enginepad = n.length } );
   
   let min = 100, max = 0, sum = 0;
   for( let i = 0; i < logs.length; i++ ) {
      const log = logs[ i ];
      
      for( let j = (args.includebase ? 0 : 1); j < enames.length; j++ ) {
	 const entry0 = log.engines.find( e => e.name === enames[ 0 ] );
	 const entry = log.engines.find( e => e.name === enames[ j ] );
	 const times0 = entry0.logs[ 0 ].times;
	 const times = entry.logs[ 0 ].times;
	 const { tm: tm0, tin: min0, tax: max0 } = utils.median( times0.rtimes );
	 const { tm, tmin, tmax } = utils.median( times.rtimes );
	 const val = Math.round((tm/tm0) * 100);

	 if (val < min) min = val;
	 if (val > max) max = val;
	 sum += val;
	 
	 port.write(util.format(format, log.name.replace("-",""), val));
      }
      port.write( "\n" );
   }
   
   port.write( "\n" );
   port.write(util.format(format, "min", min));
   port.write( "\n" );
   port.write(util.format(format, "max", max));
   port.write( "\n" );
   port.write(util.format(format, "mean", Math.round(sum / logs.length)));
   port.write( "\n" );
}


