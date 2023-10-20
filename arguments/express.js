"use strict";

// don't change the layout of the function
function REQ(params, body, query) {
   this.params = params;
   this.body = body;
   this.query = query;
}

const req0 = new REQ({"arg0": 10}, {"arg1": 20}, {"arg2": 30});
const req1 = new REQ({"arg1": 10}, {"arg1": 20}, {"arg2": 30});
const req2 = new REQ({"arg2": 10}, {"arg1": 20}, {"arg2": 30});

function param(name, defaultValue) {
  var params = this.params || {};
  var body = this.body || {};
  var query = this.query || {};

  var args = arguments.length === 1
    ? 'name'
    : 'name, default';
  //deprecate('req.param(' + args + '): Use req.params, req.body, or req.query instead');

  if (null != params[name] && params.hasOwnProperty(name)) return params[name];
  if (null != body[name]) return body[name];
  if (null != query[name]) return query[name];

  return defaultValue;
};

req0.param = param;
req1.param = param;
req2.param = param;


function main(bench, n) {
   let res = 0;
   const k = Math.round(n / 10);
   let m = 1, j = 0;
   
   console.log(bench + "(" + n + ")...");
   
   while (n-- > 0) {
      if (j === k) { console.log( m++ ); j = 0; } else { j++; }
      res = req0.param("arg0", 40);
      res = req0.param("arg0");
      res = req1.param("arg1", 40);
      res = req1.param("arg1");
      res = req2.param("arg2", 40);
      res = req2.param("arg2");
   }

   console.log("res=", res);
}

const DEFAULT = 30000000;
const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 2
   : process.argv[ 2 ] ? parseInt(process.argv[ 2 ]) || DEFAULT: DEFAULT;

main("express", N); 
