/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/runbench.js               */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Fri Apr 14 05:59:26 2017                          */
/*    Last change :  Thu Oct 28 08:40:41 2021 (serrano)                */
/*    Copyright   :  2017-21 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Run benchmarks                                                   */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require("path");
const fs = require("fs");
const rc = require("./rc.js");
const format = require("util").format;
const exec = require("child_process").exec;
const time = require(hop.systime).time;
const system = require("./exec.hop");

const argsparse = require("minimist");
const jsonformat = require("json-format");

import { loadEngines } from "./engine.js";

let dt = new Date();

/*---------------------------------------------------------------------*/
/*    compatibility                                                    */
/*---------------------------------------------------------------------*/
if (!("isAbsolute" in path)) {
   path.isAbsolute = function(p) {
      return p[0] == '/';
   }
}
      
/*---------------------------------------------------------------------*/
/*    normalizeCwd ...                                                 */
/*---------------------------------------------------------------------*/
function normalizeCwd(file) {
   if (path.isAbsolute(file)) {
      return file;
   } else {
      return path.join(process.cwd(), file);
   }
}

/*---------------------------------------------------------------------*/
/*    global variables                                                 */
/*---------------------------------------------------------------------*/
let config;

/*---------------------------------------------------------------------*/
/*    forEachAsync ...                                                 */
/*---------------------------------------------------------------------*/
Array.prototype.forEachAsync = function(proc) {
   const arr = this;
   
   function loop(i) {
      if (i < arr.length) {
	 return proc(arr[i])
	    .then(sec => loop(i + 1));
      } else {
	 return Promise.resolve();
      }
   }

   return loop(0);
}

/*---------------------------------------------------------------------*/
/*    JSON.format ...                                                  */
/*---------------------------------------------------------------------*/
JSON.format = function(o) {
   return jsonformat(o, {
      type: 'space',
      size: 2
   });
}

/*---------------------------------------------------------------------*/
/*    execPromise ...                                                  */
/*---------------------------------------------------------------------*/
function execPromise(cmd, action) {
   if (config.verbose >= 2) {
      process.stdout.write("    " + action + ": " + cmd + "\n");
   }
   
   return new Promise((resolve, reject) => {
      const proc = exec(cmd, (error, stdout, stderr) => {
	 if (error) {
	    reject(error);
	 }
      });

      proc.on("exit", (code, signal) => {
	 if (code === 0) {
	    resolve(code);
	 } else {
	    reject(code);
	 }
      });
      
      proc.on("error", (code, signal) => {
	 reject(code);
      });
   });
}

/*---------------------------------------------------------------------*/
/*    execSync ...                                                     */
/*---------------------------------------------------------------------*/
function execSync(cmd, action) {
   if (config.verbose >= 2) {
      process.stdout.write(".");
   }

   return system.system(cmd);
}

/*---------------------------------------------------------------------*/
/*    benchLog ...                                                     */
/*---------------------------------------------------------------------*/
function benchLog(bench, engine, cmd, times, subtitle, args) {

   function mkBenchLogEngineEntry(times) {
      const e = {
	 date: dt,
	 times: times,
	 time: times.ustimes.length > 0 ? Math.min.apply(null, times.ustimes) : -1
      };
      
      if (config.message) {
	 e.message = config.message;
      }
      
      return e;
   }
   
   function mkBenchLogEngine(engine, cmd, times) {
      return {
	 name: engine.name,
	 version: engine.version,
	 host: config.host.replace(/[.].*$/, ""),
	 platform: config.platform,
	 cmd: cmd,
	 logs: [mkBenchLogEngineEntry(times)]
      };
   }

   function mkBenchLog(bench, elog) {
      return {
	 name: bench.name + (subtitle ? "-" + subtitle : ""),
	 subtitle: subtitle,
	 path: bench.path,
	 args: args, 
	 engines: [elog]
      }
   }

   function isEngine(e) {
      return e.name === engine.name
	 && e.version === engine.version
	 && e.host === config.host
	 && e.platform === config.platform;
   }
   
   function readLogs(json) {
      if (fs.existsSync(json)) {
	 try { 
	    const log = require(normalizeCwd(json));
	    
	    if (log instanceof Array) {
	       return log;
	    } else {
	       return false;
	    }
	 } catch(_) {
	    return false;
	 }
      } else {
	 return false;
      }
   }
      
   function mkBenchLogs(json) {
      const logs = readLogs(json);
      
      if (logs) {
	 const old = logs.find(e => e.name === bench.name);

	 if (old) {
	    const eng = old.engines.find(isEngine);
	    if (eng) {
	       eng.logs.push(mkBenchLogEngineEntry(times));
	    } else {
	       old.engines.push(mkBenchLogEngine(engine, cmd, times));
	    }
	 } else {
	    logs.push(mkBenchLog(bench, mkBenchLogEngine(engine, cmd, times)));
	 }
	 return logs;
      } else {
	 return [mkBenchLog(bench, mkBenchLogEngine(engine, cmd, times))];
      }
   }
   
   return new Promise((resolve, reject) => {
      if (config.log) {
	 let json = bench.path.replace(/[.]js$/, "") 
	     + (subtitle ? "-" + subtitle : "")
	     + ".log.json"

	 if (config.directory) {
	    json = path.join(config.directory, path.basename(json));
	 }
	 if (config.verbose >= 4) {
	    process.stdout.write(" dump [" + json + "]...");
	 }
	 fs.writeFile(json, 
	    JSON.format(mkBenchLogs(json)),
	    err => { 
	       if (err) {
		  reject(err) 
	       } else {
	 	  if (config.verbose >= 4) {
	    	     process.stdout.write("done.");
		  }
		  resolve(0);
	       }
	    });
	 // wait for writeFile to flush
	 setTimeout(resolve, 100);
      } else {
	 resolve(0);
      }
   });
}
   

/*---------------------------------------------------------------------*/
/*    runBench ...                                                     */
/*---------------------------------------------------------------------*/
function runBench(bench, engine) {

   function sec(ms) {
      let s = ms / 1000;

      return s.toFixed(2);
   }

   function chrono(cmd) {
      const iteration = Math.min(config.iteration || engine.iteration,
				  engine.maxIteration || config.iteration || engine.iteration);
      const ustimes = new Array(iteration), rtimes = new Array(iteration);
      
      if (config.verbose >= 3) {
	 process.stdout.write("    run ["
			       + (iteration || config.run) + "]: "
			       + "\"" + cmd + "\" ");
      }

      for (let i = 0; i < (iteration || config.run); i++) {
	 const { res, rtime, stime, utime } = time(() => execSync(cmd, "."));

	 if (res != 0) {
	    process.stdout.write(" -1\n");
	    return { ustimes: [], rtimes: [] };
	 }

	 ustimes[i] = (stime + utime);
	 rtimes[i] = rtime;
      }

      if (config.verbose >= 1) {
      	 process.stdout.write(
	    " real: " + sec(Math.min.apply(null, rtimes)) + 
	    ", usr+sys: " + sec(Math.min.apply(null, ustimes)) + "\n");
      }

      return { ustimes, rtimes };
   }
   
   function benchCmd(args) {
      return engine.cmd
	 .replace(/@PATH@/g, bench.path)
	 .replace(/@DIRNAME@/g, path.dirname(bench.path))
	 .replace(/@TMP@/g, config.tmp)
	 .replace(/@HOME@/g, process.env.home)
	 .replace(/@NAME@/g, bench.name)
	 .replace(/@COMPILER@/g, engine.compiler || "")
	 .replace(/@INTERPRETER@/g, engine.interpreter || "")
	 .replace(/@EXTRAOPTS@/g, engine.extraopts || "")
	 .replace(/@ENGINE@/g, engine.name || "")
	 + (args ? " " + args : "");
   }

   function compile(args) {
      const target = path.join(config.tmp, bench.name + "." + engine.name);
      const stattarget = fs.existsSync(target) && fs.statSync(target);
      const statsrc = fs.statSync(bench.path);

      if (!config.recompile 
	  && (stattarget && (stattarget.mtime > statsrc.mtime))) {
	 return Promise.resolve(true);
      } else {
      	 return execPromise(benchCmd(args), "compile")
	    .then(v => v,
	       (err) => {
		  console.error(bench.name, "compilation failed with message", err);
	       });
      }
   }

   function argsToString(args) {
      if (typeof args === "string") {
	 return args;
      } else if (args instanceof Array) {
	 return args.toString().replace(",", " ");
      } else {
	 return args;
      }
   }
	
   function runCompile(subtitle, args) {
      const cmd = engine.run
	    .replace(/@TMP@/g, config.tmp)
	    .replace(/@NAME@/g, bench.name)
	    .replace(/@INTERPRETER@/g, engine.interpreter || "")
   	    .replace(/@ENGINE@/g, engine.name || "")
	 + (config.arg ? " " + argsToString(config.arg) : "");
      return benchLog(bench, engine, cmd, chrono(cmd), subtitle, args);
   }

   function runInterpret(subtitle, args) {
      const cmd = benchCmd((config.arg ? " " + argsToString(config.arg) : ""));

      return benchLog(bench, engine, cmd, chrono(cmd), subtitle, args);
   }
   
   function run(k = false, args = false) {
      if (engine.compiler) {
	 return compile(args).then(_ => runCompile(k, args));
      } else {
	 return runInterpret(k, args);
      }
   }

   if (config.verbose >= 1) {
      process.stdout.write("  " + engine.name + "\n");
   }

   // check for test specific engine options
   const dir = path.dirname(bench.path);
   const ejson = engine.name + ".json";
   
   if (fs.existsSync(path.join(dir, ejson))) {
      engine = 
	 Object.assign(engine, 
	    require(normalizeCwd(path.join(dir, ejson))));
   } else { 
      const name = path.basename(bench.path).replace(/.js$/, ""); 
      if (fs.existsSync(path.join(dir, name + "." + ejson))) {
      	 engine = 
	    Object.assign(engine, 
	       require(normalizeCwd(path.join(dir, name + "." + ejson))));
      }
   }
   
   if (engine.prelude) {
      // need to build the temporary source file
      const pld = engine.prelude
	    .replace(/@PATH@/g, bench.path)
	    .replace(/@DIRNAME@/g, path.dirname(bench.path))
	    .replace(/@TMP@/g, config.tmp)
	    .replace(/@NAME@/g, bench.name)
   	    .replace(/@ENGINE@/g, engine.name || "");
      const p = path.join(config.tmp, bench.name + "-" + engine.name + ".js");
      let b = fs.readFileSync(bench.path).toString();

      fs.writeFileSync(p, pld);

      if (engine.ecmascript === 5) {
	 b = b.replace(/(let|const) /g, "var ");
      }
      
      fs.appendFileSync(p, b);
   }

   if (!engine.disable) {
      const argspath = 
	    path.join(path.dirname(bench.path), 
		       path.basename(bench.path, ".js"))
	    + ".args.json";
      
      if (config.argsfile && fs.existsSync(argspath)) {
	 const args = require(normalizeCwd(argspath));
	 
	 if (engine.compiler) {
	    return compile(false)
	       .then(_ => Promise.all(
		  Object.keys(args).map(k => runCompile(k, args[k]))));
	 } else {
	    return Promise.all(
	       Object.keys(args).map(k => runInterpret(k, args[k])));
	 }
      } else {
	 return run();
      }
   } else {
      return new Promise(function(resolve, reject) {
	 resolve(-1)
      });
   }
}

/*---------------------------------------------------------------------*/
/*    runBenchmark ...                                                 */
/*---------------------------------------------------------------------*/
function runBenchmark(p) {
   
   function loadBench(p) {
      const json = p.replace(/[.]js$/, "") + ".log.json";
      const name = path.basename(p).replace(/.js$/, "");

      const test = fs.existsSync(json) ?
	    require(normalizeCwd(json)) : {};

      test.name = name;
      test.path = p;

      if (!("extraopts" in test)) {
	 test.extraopts = "";
      }
      
      return test;
   }

   const bench = loadBench(p);

   if (config.verbose >= 1) {
      process.stdout.write(bench.name + 
			    (config.arg ? "(" + config.arg + ")" : "") +
	    		    "...\n");
   }

   return config.engines.forEachAsync(e => runBench(bench, e))
      .then(_ => {
	 if (config.verbose >= 2) {
	    process.stdout.write("\n");
	 }
      });
}

/*---------------------------------------------------------------------*/
/*    main ...                                                         */
/*---------------------------------------------------------------------*/
function main() {
   
   function usage() {
      console.log("runbench v" + require("./configure.js").version);
      console.log("usage: runbench [options] path1 path2 ...");
      console.log("");
      console.log("Options:");
      console.log("  -h|--help            This message");
      console.log("  -q                   No configuration file");
      console.log("  -c|--config path     Configuration file");
      console.log("  -D,--dir dir         Directory to store log files");
      console.log("  -T,--tmp dir         Tmp directory");
      console.log("  -v[level]            Verbosity");
      console.log("  -d,--dry             Do not log");
      console.log("  -e engine            Execution engine");
      console.log("  -E,--enginedir dir   Engines directory");
      console.log("  --name command       Execution command");
      console.log("  -m|--message message Log message");
      console.log("  -a|--arg             Benchmark argument");
      console.log("  --hopc compiler      Hopc compiler");
      console.log("  --hopcflags flags    Hopc optional extra flags");
      console.log("  --date string        Set the log date");
      console.log("  --iteration n        Forced iteration number");
      console.log("  --recompile          Forced recompilation");
      console.log("  --noargsfile         Disable args file");
      console.log("");
      console.log("Examples: ");
      console.log("  hop --no-server -- runbench.js -v3 -e hop ../micro/poly.js");
      console.log("  hop --no-server -- runbench.js -e hop ../micro/poly.js ../micro/ctor.js");
      console.log("  hop --no-server -- runbench.js -v3 -e hop -e nodejs -e jsc ../octane");
      console.log("  hop --no-server -- runbench.js -v3 -e hop -e nodejs -e jsc ../octane --hopc /usr/local/bin/hopc");
      
      process.exit(1);
   }

   // cmdline parsing
   if (process.argv.length == 1) {
      usage();
   }

   const argv = process.argv.slice(hop.standalone ? 1 : 2);
   const args = argsparse(argv, { names: ["-v", "-X"] });

   // configuration
   if (args.h || args.help) {
      usage();
   }

   if (args.date) {
      dt = new Date(Date.parse(args.date));
   }

   config = ("q" in args)
      ? rc.defaultConfig()
      : rc.loadConfig(args.config || args.c);

   if ("v" in args) {
      config.verbose = parseInt(args.v);
   }

   if (args.T || args.tmp) {
      config.tmp = args.T || args.tmp;
   }
   
   if (args.m || args.message) {
      config.message = args.m || args.message;
   }
   
   if (args.d || args.dry) {
      config.log = false;
   }

   config.argsfile = !args.noargsfile;

   config.engine = args.E || args.engine || config.engine || "./engine";
   config.directory = args.D || args.dir;
   config.recompile = args.recompile;
   
   config.arg = args.a || args.arg;
			  
   // load the engine plugins
   config.engines = loadEngines(args.e, args, config);
   if (!config.iteration && args.iteration)
      config.iteration = parseInt(args.iteration);

   // collect all program files
   let benchmarks = [];

   for (let i = 0; i < args._.length; i++) {
      if (fs.existsSync(args._[i])) {
	 if (fs.statSync(args._[i]).isDirectory()) {
	    let files = fs.readdirSync(args._[i])
		.filter(e => e.match(/[.]js$/))
		.map(f => path.join(args._[i], f))
	    benchmarks = benchmarks.concat(files);
	 } else 
	    benchmarks.push(args._[i]);
      } else {
	 throw "Cannot find test `" + args._[i] + "'";
      }
   }

   benchmarks
      .forEachAsync(runBenchmark)
      .then(x => { if (config.verbose >= 4) {
		       console.log(args.e, "ok"); 
		    }
		    process.exit(0); })
      .catch(e => { throw(e) });
}

main();
