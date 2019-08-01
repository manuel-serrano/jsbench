/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/webtooling.js             */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Wed Feb  7 10:57:42 2018                          */
/*    Last change :  Wed Feb  7 17:17:12 2018 (serrano)                */
/*    Copyright   :  2018 Manuel Serrano                               */
/*    -------------------------------------------------------------    */
/*    Hop V8 web tooling driver                                        */
/*=====================================================================*/
"use hopscript";

// (cd /opt/JS/WEBTOOLING/web-tooling-benchmark; HOPTRACE="hopscript:cache format:json" hop -v3 --no-server --libs-dir /tmp/serrano/libs --js-es2017 --hopc-flags "-Ox --profile" --profile -- $HOME/trashcan/webtooling.js jshint-benchmark)

if( "hop" in process.versions ) {
   hop.compilerDriver.addEventListener( "start", e => {
      console.log( `compiling ${e.target}: ${e.value.command}` );
   } )

   hop.compilerDriver.addEventListener( "end", e => {
      console.log( `${e.target}... ${e.value == 0 ? "success" : "failure"}` );
   } )
}

const WEBTOOLING_ROOT = "/opt/JS/WEBTOOLING/web-tooling-benchmark";
const name = process.argv[ 2 ];
console.log( `${name}...` );

const bench = require( WEBTOOLING_ROOT + "/src/" + name );

let res = bench.fn();
console.log( "res=", res );
