/*=====================================================================*/
/*    serrano/prgm/project/hop/bench/jsbench/tools/common.js           */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu Jan  4 14:17:43 2018                          */
/*    Last change :  Sun Nov 10 08:53:39 2024 (serrano)                */
/*    Copyright   :  2018-24 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Common utilities                                                 */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require("path");

/*---------------------------------------------------------------------*/
/*    compatibility                                                    */
/*---------------------------------------------------------------------*/
if (!("isAbsolute" in path)) {
   path.isAbsolute = function(p) {
      return p[ 0 ] == '/';
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
/*    mergeLogs ...                                                    */
/*---------------------------------------------------------------------*/
function mergeLogs(logfiles, args) {
   const logs = [];
   const sortp = !args.nosort;
   let stamp = 0;
   let allengines = {};

   function engineKey(g) {
      return g.name + g.version + g.host;
   }

   function engineDup(g) {
      let n = JSON.parse(JSON.stringify(g));
      n.logs = [];
      return n;
   }
   
   logfiles.forEach(f => {
      const ls = require(normalizeCwd(f));

      // collect all the engines
      ls.forEach(l => {
	 l.engines.forEach(g => {
	    g.key = engineKey(g);
	    allengines[ g.key ] = g;
	 })
      });
		  
      // add a stamp to all logs for later display
      ls.forEach(l => {
	 let s = stamp++;
	 l.engines.forEach(g => g.logs.forEach(e => e.stamp = s));
      });

      // merge all the logs
      ls.forEach(l => {
	 const ol = logs.find(o => o.name == l.name);

	 if (ol) {
	    l.engines.forEach(e => {
	       const oe = ol.engines.find(o => {
		  return o.name == e.name
		     && o.version == e.version
		     && o.host == e.host
	       });
					   
	       if (oe) {
		  oe.logs = Array.prototype.concat.apply(oe.logs, e.logs);
	       } else {
		  ol.engines.push(e);
	       }
	    });
	 } else {
	    logs.push(l);
	 }
      })
   });

   // add the lacking engines
   logs.forEach(l => {
      for (let key in allengines) {
	 if (!l.engines.find(g => engineKey(g) == key)) {
	    l.engines.push(engineDup(allengines[ key ]));
	 }
      }
   });

   // sort all the engines by keys
   logs.forEach(l => {
      l.engines = l.engines.sort((g1, g2) => g1.key > g2.key);
   });

   // sort all the logs according to the stamps
   logs.forEach(l => {
      l.engines.forEach(e => {
	 e.logs = e.logs.sort((l1, l2) => l1.stamp > l2.stamp);
      });
   });

   // sort the logs
   if (!sortp) {
      return logs;
   } else if (!args.sortalias) {
      return logs.sort((e1, e2) => e1.name.naturalCompare(e2.name) >= 0);
   } else {
      const alias = {};
      
      for (let e of logs) {
	 alias[ e.name ] = e.name;
      }
      
      if (typeof args.sortalias === "string") {
      	 const s = args.sortalias.split(":");
      	 alias[ s[ 0 ] ] = s[ 1 ];
      } else {
	 args.sortalias.forEach(a => {
      	       const s = a.sortalias.split(":");
      	       alias[ s[ 0 ] ] = s[ 1 ];
	    });
      }
      
      return logs.sort((e1, e2) => alias[ e1.name ].naturalCompare(alias[ e2.name ]) >= 0);
   }
}

exports.normalizeCwd = normalizeCwd;
exports.mergeLogs = mergeLogs;
