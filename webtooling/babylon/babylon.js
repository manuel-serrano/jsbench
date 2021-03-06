/*=====================================================================*/
/*    .../prgm/project/hop/jsbench/webtooling/babylon/babylon.js       */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Wed Feb  7 10:57:42 2018                          */
/*    Last change :  Mon Jan  7 07:39:53 2019 (serrano)                */
/*    Copyright   :  2018-19 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Hop V8 web tooling driver                                        */
/*=====================================================================*/
"use hopscript";

if( "hop" in process.versions ) {
   hop.compilerDriver.addEventListener( "start", e => {
      console.log( `compiling ${e.target}: ${e.value.command}` );
   } )

   hop.compilerDriver.addEventListener( "end", e => {
      console.log( `${e.target}... ${e.value == 0 ? "success" : "failure"}` );
   } )
}

const bench = require( "./babylon-benchmark.js" );

let res = bench.fn();
console.log( "res=", res.map( e => e.end - e.start) );
