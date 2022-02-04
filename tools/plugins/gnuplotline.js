/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/tools/plugins/gnuplotline.js        */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:53:11 2017                          */
/*    Last change :  Fri Feb  4 09:27:52 2022 (serrano)                */
/*    Copyright   :  2017-22 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Generate a gnuplot line, each horizontal tick is a benchmark.    */
/*    This plugin was implemented for the jsprop paper.                */
/*    the .csv file is generated on stdout, the .plot on stdout        */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require("path");
const fs = require("fs");
const format = require("util").format;
const common = require("../common.js");
const utils = require("./utils.js");

/*---------------------------------------------------------------------*/
/*    collectEngines ...                                               */
/*---------------------------------------------------------------------*/
function collectEngines(logs) {
   const enames = [];

   logs.forEach(log => {
      log.engines.forEach(e => {
	 if (enames.indexOf(e.name) < 0) { enames.push(e.name) };
      });
   });

   return enames;
}

/*---------------------------------------------------------------------*/
/*    colors ...                                                       */
/*---------------------------------------------------------------------*/
const colors = ['#3264c8', '#d83812', '#fa9600', '#109318', '#960096', '#0096c2'];
   
/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function(logfiles, engines, args, config) {
   const alogs = logfiles.map(l => require(common.normalizeCwd(l)));

   const logs = common.mergeLogs(logfiles, args);
   const enames = engines.length > 0
	 ? engines.map(e => e.name)
	 : collectEngines(logs);
   let enginepad = 6;
   
   if (logs.length === 0) {
      throw TypeError("no logs found");
   }
   
   const title = args.t || args.title || logs[0].name;
   const format = args.format || args.f || "svg";
   const output = args.o || args.output || (logs[0].name + "." + format);
   const base = output.replace(/.[^.]+$/, '');
   const size = args.size || "1024,768";
   const start = args.start ? parseInt(args.start) : 0;
   const deviation = args.deviation ? parseFloat(args.deviation) : 0;
   
   enames.forEach(n => { if (n.length > enginepad) enginepad = n.length });
   enginepad += (deviation > 0 ? 8 : 4);
   
   // plot data
   process.stdout.write('#    ');
   enames.forEach(n => process.stdout.write(utils.padding(n, enginepad)));
   process.stdout.write("\n");
   
   for (let i = start; i < logs.length; i++) {
      const log = logs[i];
      process.stdout.write(utils.padding((i+1) + "," , 5));
      
      for (let j = 0; j < enames.length; j++) {
	 const entry = log.engines.find(e => e.name === enames[j]);
	 
	 if (entry) {
	    const times = entry.logs[0].times;
	    const { tm, min, max } = utils.median(times.rtimes)
	       const mn = utils.mean(times.rtimes);
	       let str = (tm/1000).toFixed(2);
	       
	       if (deviation > 0) {
	    	  str += ", ";
	    	  
	    	  const dev = (utils.deviation(times.rtimes) * 10 / mn);
	    	  
	    	  if (dev > deviation) {
	       	     str += dev.toFixed(2);
	    	  } else {
	       	     str += "0.0";
	    	  }
	       }
	       
	       if (j < enames.length - 1) {
	    	  str += ",";
	       }
	       
	       process.stdout.write(utils.padding(str, enginepad));
      	 }
      }
      process.stdout.write("\n");
   }
   process.stdout.write("\n");
   
   // plot file
   process.stderr.write(`set title '${title}'`);
   process.stderr.write("\n\n");
   
   // output format
   switch(format) {
      case "pdf": 
	 process.stderr.write("set terminal pdf\n");
	 break;
	 
      case "svg":
	 process.stderr.write(`set terminal svg size ${size} font "Verdana,14"`);
	 process.stderr.write("\n");
   }
   process.stderr.write(`set output '${output}'`);
   process.stderr.write("\n\n");
   
   for (let i = 0; i < enames.length; i++) {
      process.stderr.write(`set style line ${i+1} linecolor rgb '${colors[i]}' linetype 1 linewidth 2 pointtype 7 pointsize 1`);
      process.stderr.write("\n");
   }
   process.stderr.write("\n\n");
   process.stderr.write("set style line 100 lc rgb '#808080' lt 1\n")
   process.stderr.write("set border 3 back ls 100\nset tics nomirror\n\n");
   
   process.stderr.write("set style line 101 lc rgb '#808080' lt 0 lw 1\n");
   process.stderr.write("set grid back ls 101\n\n");

   switch(args.legend) {
      case "top-right":
	 process.stderr.write("set key top right\n\n");
	 break;
	 
      case "bottom-right":
	 process.stderr.write("set key bottom right\n\n");
	 break;
	 
      case "bottom-left":
	 process.stderr.write("set key bottom left\n\n");
	 break;
	 
      case "top-left":
      default:
	 process.stderr.write("set key top left\n\n");
   }
   
   switch(args.logscale) {
      case "y": process.stderr.write("set logscale y\n\n"); break;
      case "x": process.stderr.write("set logscale x\n\n"); break;
      case "xy": process.stderr.write("set logscale xy\n\n"); break;
   }
   
   if (args.xlabel) {
      process.stderr.write(`set xlabel '${args.xlabel}'`);
      process.stderr.write("\n");
   }
   if (args.ylabel) {
      process.stderr.write(`set ylabel '${args.ylabel}'`);
      process.stderr.write("\n");
   }
      
   if (start > 0) {
      process.stderr.write(`set xrange [${start}:${logs.length}]`);
      process.stderr.write("\n\n");
   }

   process.stderr.write(`plot`);
   process.stderr.write(" \\\n");
   
   if (args.deviation > 0) {
      for (let i = 0; i < enames.length; i++) {
      	 process.stderr.write(`  '${base}.csv' u 1:${(i*2)+2} w linespoints title '${enames[i]}' ls ${i+1}`);
	 process.stderr.write(", \\\n");
	 
      	 process.stderr.write(`  '${base}.csv' u 1:${(i*2)+2}:${(i*2)+3} w yerrorbars notitle ls ${i+1}`);
      	 if (i < enames.length - 1) {
	    process.stderr.write(", \\\n");
      	 } else {
	    process.stderr.write("\n");
      	 }
      }
   } else {
      for (let i = 0; i < enames.length; i++) {
      	 process.stderr.write(`  '${base}.csv' u 1:${i+2} w linespoints title '${enames[i]}' ls ${i+1}`);
      	 if (i < enames.length - 1) {
	    process.stderr.write(", \\\n");
      	 }
      }
   }
   
   process.stderr.write("\n\n");
}


