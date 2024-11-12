/*=====================================================================*/
/*    .../hop/bench/jsbench/tools/plugins/gnuplothistogram.js          */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Apr 16 06:53:11 2017                          */
/*    Last change :  Tue Nov 12 18:48:37 2024 (serrano)                */
/*    Copyright   :  2017-24 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Generate a gnuplot histogram, each bar is a benchmark.           */
/*    This plugin was implemented for the jsdynprop paper.             */
/*    the .csv file is generated on stderr, the .plot on stdout        */
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
const defaultColors = ['#3264c8', '#109318', '#d83812', '#fa9600', '#960096', '#93ade2', '#edd20b', '#00a0bf', '#72bf00'];
const defaultBoxwidth = 0.9;
const defaultFont = "Verdana,12";
const unitRatio = 1000;

/*---------------------------------------------------------------------*/
/*    ports                                                            */
/*---------------------------------------------------------------------*/
let csvport = process.stderr;
let plotport = process.stdout;

/*---------------------------------------------------------------------*/
/*    Port ...                                                         */
/*---------------------------------------------------------------------*/
// @sealed
class Port {
#fd;
   
   constructor(fd) {
      this.#fd = fd;
   }
   
   write(buf) {
      fs.writeSync(this.#fd, buf);
   }
   
   close() {
      fs.closeSync(this.#fd);
   }
}

/*---------------------------------------------------------------------*/
/*    csv ...                                                          */
/*    -------------------------------------------------------------    */
/*    Generate the CSV data file.                                      */
/*---------------------------------------------------------------------*/
function csv(port, start, enames, logs, enginepad, uratio, deviation, relative, args) {
   port.write('#                  ');
   enames.forEach(n => port.write(utils.padding(n, enginepad)));
   port.write("\n");
   
   for (let i = start; i < logs.length; i++) {
      const log = logs[i];
      port.write(utils.padding(log.name.replace(/_/g, "-") + ",", 19));
      port.write(" ");
      let base = 0;
      
      for (let j = 0; j < enames.length; j++) {
	 const entry = log.engines.find(e => e.name === enames[j]);
	 try {
	    const times = entry.logs[0].times;
	    const { tm, min, max } = utils.median(times.rtimes)
	    const mn = utils.mean(times.rtimes);

	    let val = (tm/uratio);

	    if (relative) {
	       if (j === 0) {
		  base = val;
		  val = 1;
	       } else {
		  val = val / base;
	       }
	    }
	    
	    let str = (isNaN(val) ? 0 : val).toFixed(2);
	    
	    if (deviation > 0) {
	       str += ", ";
	       
	       const dev = (utils.deviation(times.rtimes) * 10 / mn);
	       
	       if (dev > deviation) {
		  str += dev.toFixed(2);
	       } else {
		  str += "0.0";
	       }
	    } else if (args.errorbars) {
	       const minval = min/uratio;
	       const maxval = max/uratio;

	       str += ",";
	       str += (isNaN(minval) ? val : minval).toFixed(2);
	       str += ",";
	       str += (isNaN(maxval) ? val : maxval).toFixed(2);
	    }
	    
	    if (j < enames.length - 1) {
	       str += ",  ";
	    }

	    if (j > 0 || relative !== "sans") {
	       port.write(utils.padding(str, enginepad));
	    }
	 } catch (e) {
	    console.error("\n***ERROR: Illegal entry for",
			  '"' + enames[j] + "@" + log.name + '"');
	    throw e;
	 }
      }
      port.write("\n");
   }
   port.write("\n");
}

/*---------------------------------------------------------------------*/
/*    engineName ...                                                   */
/*---------------------------------------------------------------------*/
function engineName(name, aliases) {
   const n = name.trim();
   for (let i = 0; i < aliases.length; i++) {
      if (n === aliases[i][0]) {
	 return aliases[i][1];
      }
   }

   return n;
}

/*---------------------------------------------------------------------*/
/*    plot ...                                                         */
/*---------------------------------------------------------------------*/
function plot(port, csv, deviation, errorbars, enames, title, lastslash, relative, alias) {
   const start = relative === "sans" ? 1 : 0;
   
   if (deviation > 0) {
      for (let i = start; i < enames.length; i++) {
      	 plotport.write(`  '${csv}' u ${((i-start)*2)+2}:${(i*2)+3}:xtic(1) ${title} '${engineName(enames[i], alias)}' ls ${i + 1} `);
      	 if (lastslash || i < enames.length - 1) {
	    plotport.write(", \\\n");
      	 } else {
	    plotport.write("\n");
      	 }
      }
   } else if (errorbars) {
      for (let i = start; i < enames.length; i++) {
      	 plotport.write(`  '${csv}' u ${((i-start)*3)+2}:${(i*3)+3}:${(i*3)+4}:xtic(1) ${title} '${engineName(enames[i], alias)}' ls ${i + 1} `);
      	 if (lastslash || i < enames.length - 1) {
	    plotport.write(", \\\n");
      	 } else {
	    plotport.write("\n");
      	 }
      }
   } else {
      for (let i = start; i < enames.length; i++) {
      	 plotport.write(`  '${csv}' u ${(i-start)+2}:xtic(1) ${title} '${engineName(enames[i], alias)}' ls ${i + 1}`);
      	 if (lastslash || i < enames.length - 1) {
	    plotport.write(", \\\n");
      	 }
      }
   }
}

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
   const linestyle = args.lineStyle || 1;

   if (logs.length === 0) {
      throw TypeError("no logs found");
   }
   
   const title = args.t || args.title || 
      ((!"title" in args) ? logs[0].name : "");
   const format = args.format || args.f || "svg";
   const output = config.target || config.T || config.output || args.o || args.output || (logs[0].name + "." + format);
   const base = output.replace(/[.][^.]+$/, '');
   const start = args.start ? parseInt(args.start) : 0;
   const deviation = args.deviation ? parseFloat(args.deviation) : 0;
   const errorbars = args.errorbars;
   const uratio = args.unitRatio || unitRatio;
   const colors = config.colors || defaultColors; 
   const subhistos = args.subhistograms ? args.subhistograms.split(" ") : false;
   const relative = args.relativesans ? "sans" : (args.relative ? "avec" : false);
   const alias = args.alias.map(s => s.split('='));

   enames.forEach(n => { if (n.length > enginepad) enginepad = n.length });
   enginepad += ((deviation > 0 || errorbars) ? 8 : 4);

   // config target
   if (config.target && base) {
      csvport = new Port(fs.openSync(base + ".csv", "w"));
      plotport = new Port(fs.openSync(base + ".plot", "w"));
   }
      
   // csv files
   if (subhistos) {
      if (logs.length % subhistos.length !== 0) {
	 throw new Error("Number of entries not a multiple of histograms");
      }
      const len = subhistos.length;
      const num = logs.length / subhistos.length;

      for (let i = 0, j = 0; i < subhistos.length; i++, j += num) {
	 if (config.target) {
	    const name = base + j + ".csv";
	    const port = new Port(fs.openSync(name, "w"));
	    try {
	       const l = logs.slice(j, j + num);
	       csv(port, start, enames, l, enginepad, uratio, deviation, relative, args);
	    } finally {
	       port.close();
	    }
	 } else {
	    csv(csvport, start, enames, logs, enginepad, uratio, deviation, relative, args);
	 }
      }
   } else {
      csv(csvport, start, enames, logs, enginepad, uratio, deviation, relative, args);
   }

   // generated file
   plotport.write(`# generated file gnuplotthistogram.js (${new Date()})`);
   plotport.write("\n");
   
   // output format
   switch(format) {
      case "pdf": 
	 plotport.write("set terminal pdf");
	 if (args.size) {
	    plotport.write(` size ${args.size}`);
	 }
	 plotport.write(` font "${args.font || defaultFont}"`);
	 plotport.write("\n");
	 break;
	 
      case "svg":
	 plotport.write("set terminal svg");
	 if (args.size) {
	    plotport.write(` size ${args.size}`);
	 }
	 plotport.write(` font "${args.font || defaultFont}"`);
	 plotport.write("\n");
	 if (args.size) {
	    plotport.write(`set size ${args.size}`);
	 }
   }
   plotport.write(`set output '${output}'`);
   plotport.write("\n");
   if (args.canvasSize) {
      plotport.write(`set size ${args.canvasSize}`);
      plotport.write("\n");
   }
   plotport.write("\n");

   // plot file
   plotport.write(`set title '${title}'`);
   plotport.write("\n");
   if (args.ylabel) {
      plotport.write(`set ylabel "${args.ylabel}" ${args.ylabelopt || ""}`);
      plotport.write("\n");
   }
   plotport.write("\n");
   if (args.yrange) {
      plotport.write(`set yrange ${args.yrange}`);
      plotport.write("\n");
   }
   
   plotport.write("set auto x\n\n");
   plotport.write("set style data histogram\n");
   
   if (deviation || errorbars) {
      plotport.write("set style histogram gap 1 errorbars lw 1\n");
      plotport.write(`set errorbars lc ${args.errorbars === true ? "black" : args.errorbars}`);
      plotport.write("\n");
   } else {
      plotport.write("set style histogram cluster gap 1\n");
   }
   
   if (args.xtics === "no") {
      plotport.write("unset xtics\n\n");
   } else if (args.xtics === "rotate") {
      plotport.write("set xtics rotate by 45 scale 0\n\n");
   } else if (args.xtics === "rotater") {
      plotport.write("set xtics rotate by 45 right\n\n");
   } else if (args.xtics) {
      plotport.write(`set xtics ${args.xtics}`);
      plotport.write("\n");
   }      
   
   if (args.xticsFont) {
      plotport.write(`set xtics font "${args.xticsFont}"`);
      plotport.write("\n");
   } else {
      plotport.write(`set xtics font 'Verdana,8'`);
      plotport.write("\n");
   }
   
   if (args.yticsFont) {
      plotport.write(`set ytics font "${args.yticsFont}"`);
      plotport.write("\n\n");
   } else {
      plotport.write(`set ytics font 'Verdana,9'`);
      plotport.write("\n\n");
   }
   
   plotport.write(`set boxwidth ${args.boxwidth || defaultBoxwidth}`);
   plotport.write("\n");
   plotport.write("set style fill solid\n");
   for (let i = 0; i < enames.length; i++) {
      plotport.write(`set style line ${i+1} linecolor rgb '${colors[(i + linestyle - 1) % colors.length]}' linetype 1 linewidth 1`);
      plotport.write("\n");
   }
   
   if (deviation) {
      plotport.write("set style line 100 linecolor rgb '#000000' linetype 1 linewidth 1\n");
   }
   if (errorbars) {
      plotport.write("set style line 100 linecolor rgb '#000000' linetype 1 linewidth 1\n");
   }
   
   plotport.write("\n");
   plotport.write("set grid ytics\n");
   plotport.write("set xtics scale 0\n");
   plotport.write('set datafile separator ","');
   plotport.write("\n\n");

   if (args.lmargin) {
      plotport.write(`set lmargin ${args.lmargin}`);
      plotport.write("\n");
   }
   if (args.rmargin) {
      plotport.write(`set rmargin ${args.rmargin}`);
      plotport.write("\n");
   }
   if (args.bmargin) {
      plotport.write(`set bmargin ${args.bmargin}`);
      plotport.write("\n");
   }
   if (args.tmargin) {
      plotport.write(`set tmargin ${args.tmargin}`);
      plotport.write("\n");
   }

   const lh = args.legendHeight ? ` height ${args.legendHeight} ` : "";
   switch(args.legend) {
      case "top-right":
	 plotport.write("set key top right" + lh + "\n");
	 break;
	 
      case "top-rightmargin":
	 plotport.write("set key top rm" + lh + "\n");
	 break;
	 
      case "bottom-right":
	 plotport.write("set key bottom right" + lh + "\n");
	 break;
	 
      case "bottom-left":
	 plotport.write("set key bottom left" + lh + "\n");
	 break;
	 
      case "bottom-leftmargin":
	 plotport.write("set key bottom lm" + lh + "\n");
	 break;
	 
      case "top-left":
	 plotport.write("set key top left" + lh + "\n");
	 break;
	 
      default:
	 plotport.write("set key under nobox" + lh + "\n");
   }
   
   if (args.logscale) {
      plotport.write(`set logscale ${args.logscale}`);
      plotport.write("\n");
   }
   
   
   if (args.xlabel) {
      plotport.write(`set xlabel '${args.xlabel}'`);
      plotport.write("\n");
   }
   if (args.ylabel) {
      plotport.write(`set ylabel '${args.ylabel}'`);
      plotport.write("\n");
   }
      
   if (start > 0) {
      plotport.write(`set xrange [${start}:${logs.length}]`);
      plotport.write("\n\n");
   }

   if (args.yrange) {
      plotport.write(`set yrange ${args.yrange}`);
      plotport.write("\n");
   }
   
   plotport.write("\n");


   if (relative === "sans") {
      plotport.write("set arrow 1 from graph 0, first 1 to graph 1, first 1 nohead lc 'black' lw 2 dt '---' front\n");
      plotport.write("set label 1 '" + enames[0] + " ' font 'Verdana,10' at " + (logs.length - 1) + ",1 offset -0.5,0.5 tc 'black' front\n\n");
   }
   
   plotport.write(`plot`);
   plotport.write(" \\\n");
      
   // plot data
   if (subhistos) {
      const len = subhistos.length;
      const num = logs.length / subhistos.length;

      for (let i = 0, j = 0; i < subhistos.length; i++, j += num) {
	 if (args.nosubhistogramnames) {
	    plotport.write(` newhistogram lt 1, `);
	 } else {
	    plotport.write(` newhistogram "${subhistos[i]}" lt 1, `);
	 }
	 plotport.write("\\\n");
	 plot(plotport, base + j + ".csv", deviation, errorbars, enames, i === 0 ? "title" : "notitle", i < subhistos.length - 1, relative, alias);
      }
   } else {
      plot(plotport, base + ".csv", deviation, errorbars, enames, "title", false, relative, alias);
   }
   
   plotport.write("\n\n");
   
   if (plotport !== process.stdout) {
      plotport.close();
   }
   if (csvport !== process.stderr) {
      csvport.close();
   }
}


