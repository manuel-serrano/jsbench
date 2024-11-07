/*=====================================================================*/
/*    .../article/jsasync/bench/jsbench/tools/logbench.js              */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sat Apr 15 10:16:47 2017                          */
/*    Last change :  Mon Mar  6 10:19:30 2023 (serrano)                */
/*    Copyright   :  2017-24 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Output bench log                                                 */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require("path");
const fs = require("fs");
const rc = require("./rc.js");
const format = require("util").format;

const argsparse = require("minimist");

import { loadEngines } from "./engine.js";

/*---------------------------------------------------------------------*/
/*    global variables                                                 */
/*---------------------------------------------------------------------*/
let config;

/*---------------------------------------------------------------------*/
/*    main ...                                                         */
/*---------------------------------------------------------------------*/
function main() {
   
   function usage() {
      console.log("logbench v" + require("./configure.js").version);
      console.log("usage: logbench [options] plugin path1 path2 ...");
      console.log("");
      console.log("Options:");
      console.log("  -h|--help           This message");
      console.log("  -q                  No configuration file");
      console.log("  -c|--config         Configuration file");
      console.log("  -e                  Execution engine");
      console.log("  -E,-enginedir dir   Engines directory");
      console.log("  -o|--output         output file (deprecated, use -t)");
      console.log("  -T|--target         target files (*)");
      console.log("  -v[int]             Verbose");
      console.log("  --acceptmissing     Accept missing engines");
      console.log("  --nosort            Don't sort benchmarks");
      console.log("  --sortalias         Use alias name when sorting");
      console.log("");
      console.log("Examples: ");
      console.log("  hop -g --no-server -- logbench.js xgraph.js ../micro/poly.log.json | xgraph");
      console.log("");
      console.log("(*) ");
      console.log("  As of March 2023, --target is only supported by gnuplothistogram plugin");
      process.exit(1);
   }

   // cmdline parsing
   if (process.argv.length == 1) {
      usage();
   }

   const argv = process.argv.slice(hop.standalone ? 1 : 2);
   const args = argsparse(argv, { names: ["-v"] });
   
   // configuration
   if (args.h || args.help) {
      usage();
   }

   config = ("q" in args)
      ? rc.defaultConfig()
      : rc.loadConfig(args.config || args.c);

   if ("v" in args) {
      config.verbose = typeof args.v === "number" ? args.v : 1;
   }

   if (args.m || args.message) {
      config.message = args.m || args.message;
   }
   
   if (args.d || args.dry) {
      config.log = false;
   }

   config.target = (args.T || args.target);
   config.output = (args.T || args.target || args.o || args.output);
   config.engine = args.E || args.engine || config.engine || "./engines";
					
   // load the engine plugins
   if (args._.length < 2) {
      usage();
   }

   const plugin = args._[0];
   
   // collect all program files
   let logs = [];

   for (let i = 1; i < args._.length; i++) {
      if (fs.existsSync(args._[i])) {
	 if (fs.statSync(args._[i]).isDirectory()) {
	    let files = fs.readdirSync(args._[i])
	       .filter(e => e.match(/[.]log[.]json$/))
	       .map(f => path.join(args._[i],f));
	    logs = logs.concat(files);
	 } else 
	    logs.push(args._[i]);
      }
   }

   // load the engine plugins
   const engines = loadEngines(args.e, args, config);

   try {
      require(plugin)(logs, engines, args, config);
   } catch(e) {
      require("./plugins/" + plugin)(logs, engines, args, config);
   }
}

main();
