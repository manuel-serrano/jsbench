/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/rtimes.js         */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Sun Oct 27 14:00:39 2019                          */
/*    Last change :  Wed Jan 19 11:25:59 2022 (serrano)                */
/*    Copyright   :  2019-22 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Display the mean of real executions time for one benchmark       */
/*    and one engine.                                                  */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    module imports                                                   */
/*---------------------------------------------------------------------*/
const path = require("path");
const fs = require("fs");
const format = require("util").format;
const common = require("../common.js");

/*---------------------------------------------------------------------*/
/*    mean ...                                                         */
/*---------------------------------------------------------------------*/
function mean(times) {
   let res = 0;
   
   for (let i = times.length - 1; i >= 0; i--) {
      res += times[ i ];
   }
   
   return Math.round(res / times.length);
}

/*---------------------------------------------------------------------*/
/*    logRTime ...                                                     */
/*---------------------------------------------------------------------*/
function logRTime(logs, enames, config, fd) {
   
   logs.forEach(log => {
      	 let len = 0;
      	 let engines = log.engines.filter(e => enames.indexOf(e.name) != -1);
	 
	 if (config.verbse) {
      	    console.error("log=", log);
	 }
      	 
      	 engines.forEach(e => {
	       if (e.name.length > len)
	    	  len = e.name.length;
	       if (e.host.length > len)
	    	  len = e.host.length;
	       if (e.version && (e.version.length + 2) > len)
	    	  len = 2 +  e.version.length;
      	    });

      	 len += 6;

	 engines.forEach(e => {
	       let l = e.logs[ 0 ];
	       
	       if (l && l.times.rtimes) {
		  fs.writeSync(fd, (mean(l.times.rtimes) / 1000).toFixed(2) + "\n");
		  fs.fsyncSync(fd);
	       } });
      });
}

/*---------------------------------------------------------------------*/
/*    plugin                                                           */
/*---------------------------------------------------------------------*/
module.exports = function(logfiles, engines, args, config) {
   let logs = common.mergeLogs(logfiles, config);
   let queue = [];
   
   if (engines.length == 0) {
      logs.forEach(log => {
	 log.engines.forEach(e => {
	    if (queue.indexOf(e.name) == -1) {
	       engines.push(e);
	       queue.push(e.name);
	    }
	 });
      });
   }
      
   if (config.verbse) {
      console.error("rtimes engines=" + engines + "\n");
   }
   
   const fd = (config.output || process.stdout.fd);
	
   try {
      logRTime(logs, engines.map(e => e.name), config, fd);
   } finally {
      if (config.output) {
	 fs.closeSync(fd);
      }
   }
}
