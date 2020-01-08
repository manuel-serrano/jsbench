/*=====================================================================*/
/*    .../project/hop/jsbench/tools/plugins/gnuplothistogramrel.js     */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:53:11 2017                          */
/*    Last change :  Tue Jan  7 07:47:55 2020 (serrano)                */
/*    Copyright   :  2017-20 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Generate a relative gnuplot histogram, each bar is a benchmark.  */
/*    This plugin was implemented for the jsdynprop paper.             */
/*    the .csv file is generated on stderr, the .plot on stdout        */
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
/*    colors ...                                                       */
/*---------------------------------------------------------------------*/
const colors = [ '#3264c8', '#d83812', '#fa9600', '#109318', '#960096' ];
const defaultBoxwidth = 0.9;
const defaultFont = "Verdana,18";
const unitRatio = 1000;

/*---------------------------------------------------------------------*/
/*    ports                                                            */
/*---------------------------------------------------------------------*/
const csvport = process.stderr;
const plotport = process.stdout;

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function( logfiles, engines, args ) {
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
   const format = args.format || args.f || "svg";
   const output = args.o || args.output || (logs[ 0 ].name + "." + format);
   const base = output.replace( /.[^.]+$/, '' );
   const start = args.start ? parseInt( args.start ) : 0;
   
   enames.forEach( n => { if( n.length > enginepad ) enginepad = n.length } );
   enginepad += 4;
   
   // plot data
   csvport.write( '#                  ' );
   enames.slice( 1 ).forEach( n => csvport.write( utils.padding( n, enginepad ) ) );
   csvport.write( "\n" );
   
   for( let i = start; i < logs.length; i++ ) {
      const log = logs[ i ];
      csvport.write( utils.padding( log.name + ",", 19 ) );
      csvport.write( " " );
      
      for( let j = 1; j < enames.length; j++ ) {
	 const entry0 = log.engines.find( e => e.name === enames[ 0 ] );
	 const entry = log.engines.find( e => e.name === enames[ j ] );
	 const times0 = entry0.logs[ 0 ].times;
	 const times = entry.logs[ 0 ].times;
	 const { tm: tm0, min: min0, max: max0 } = utils.median( times0.rtimes )
	 const { tm, min, max } = utils.median( times.rtimes )
	 const mn0 = utils.mean( times0.rtimes );
	 const mn = utils.mean( times.rtimes );
	 const val = (tm/tm0);
	 let str = (isNaN( val ) ? 0 : val).toFixed( 2 );

	 if( j < enames.length - 1 ) {
	    str += ",  ";
	 }
	 
	 csvport.write( utils.padding( str, enginepad ) );
      }
      csvport.write( "\n" );
   }
   csvport.write( "\n" );
   
   // output format
   switch( format ) {
      case "pdf": 
	 plotport.write( "set terminal pdf" );
	 if( args.size ) {
	    plotport.write( ` size ${args.size}` );
	 }
	 plotport.write( ` font "${args.font || defaultFont}"` );
	 plotport.write( "\n" );
	 break;
	 
      case "svg":
	 plotport.write( "set terminal svg" );
	 if( args.size ) {
	    plotport.write( ` size ${args.size}` );
	 }
	 plotport.write( ` font "${args.font || defaultFont}"` );
	 plotport.write( "\n" );
   }
   plotport.write( `set output '${output}'` );
   plotport.write( "\n" );
   if( args.canvasSize ) {
      plotport.write( `set size ${args.canvasSize}` );
      plotport.write( "\n" );
   }
   plotport.write( "\n" );
   
   // plot file
   plotport.write( `set title '${title}'` );
   plotport.write( "\n" );
   
   if( args.ylabel ) {
      plotport.write( `set ylabel "${args.ylabel}" ${args.ylabelopt || ""}` );
      plotport.write( "\n" );
   }
   plotport.write( "\n" );
   if( args.yrange ) {
      plotport.write( `set yrange ${args.yrange}` );
      plotport.write( "\n" );
   }
   
   plotport.write( "set auto x\n\n" );
   plotport.write( "set style data histogram\n" );
   
   plotport.write( "set style histogram cluster gap 1\n" );
   
   if( args.xtics === "no" ) {
      plotport.write( "unset xtics\n\n" );
   } else if( args.xtics === "rotate" ) {
      plotport.write( "set xtics rotate by 45 scale 0\n\n" );
   } else if( args.xtics === "rotater" ) {
      plotport.write( "set xtics rotate by 45 right\n\n" );
   } else {
      plotport.write( `set xtics ${args.xtics}` );
      plotport.write( "\n" );
   }
   
   if( args.xticsFont ) {
      plotport.write( `set xtics font "${args.xticsFont}"` );
      plotport.write( "\n" );
   }
   
   plotport.write( `set boxwidth ${args.boxwidth || defaultBoxwidth}` );
   plotport.write( "\n" );
   plotport.write( "set style fill solid\n" );
   for( let i = 1; i < enames.length; i++ ) {
      plotport.write( `set style line ${i} linecolor rgb '${colors[ (i + linestyle - 2) % colors.length ]}' linetype 1 linewidth 1` );
      plotport.write( "\n" );
   }
   
   plotport.write( "\n" );
   plotport.write( "set grid ytics\n" );
   plotport.write( "set xtics scale 0\n" );
   plotport.write( 'set datafile separator ","' );
   plotport.write( "\n\n" );

   if( args.lmargin ) {
      plotport.write( `set lmargin ${args.lmargin}` );
      plotport.write( "\n" );
   }
   if( args.rmargin ) {
      plotport.write( `set rmargin ${args.rmargin}` );
      plotport.write( "\n" );
   }
   if( args.bmargin ) {
      plotport.write( `set bmargin ${args.bmargin}` );
      plotport.write( "\n" );
   }
   if( args.tmargin ) {
      plotport.write( `set tmargin ${args.tmargin}` );
      plotport.write( "\n" );
   }
      
   switch( args.legend ) {
      case "top-right":
	 plotport.write( "set key top right\n\n" );
	 break;
	 
      case "bottom-right":
	 plotport.write( "set key bottom right\n\n" );
	 break;
	 
      case "bottom-left":
	 plotport.write( "set key bottom left\n\n" );
	 break;
	 
      case "top-left":
	 plotport.write( "set key top left\n\n" );
	 break;
	 
      default:
	 plotport.write( "set key under nobox\n" );
   }
   
   if( args.logscale ) {
      plotport.write( `set logscale ${args.logscale}` );;
      plotport.write( "\n" );
   }
   
   if( args.xlabel ) {
      plotport.write( `set xlabel '${args.xlabel}'` );
      plotport.write( "\n" );
   }
      
   if( start > 0 ) {
      plotport.write( `set xrange [${start}:${logs.length}]` );
      plotport.write( "\n\n" );
   }

   if( args.yrange ) {
      plotport.write( `set yrange ${args.yrange}` );
      plotport.write( "\n" );
   }
   
   plotport.write( "\n" );
   plotport.write( `plot` );
   plotport.write( " \\\n" );
   
   for( let i = 1; i < enames.length; i++ ) {
      plotport.write( `  '${base}.csv' u ${i+1}:xtic(1) title '${enames[ i ]}' ls ${i}` );
      if( i < enames.length - 1 ) {
	 plotport.write( ", \\\n" );
      }
   }
   
   plotport.write( "\n\n" );
}


