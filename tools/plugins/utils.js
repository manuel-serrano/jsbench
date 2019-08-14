/*=====================================================================*/
/*    serrano/prgm/project/hop/jsbench/tools/plugins/utils.js          */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Mon Oct  8 17:59:02 2018                          */
/*    Last change :  Mon Aug 12 08:30:54 2019 (serrano)                */
/*    Copyright   :  2018-19 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    Common utility functions                                         */
/*=====================================================================*/
"use hopscript";

/*---------------------------------------------------------------------*/
/*    padding ...                                                      */
/*---------------------------------------------------------------------*/
function padding( str, pad ) {
   if( str.length < pad ) {
      for( let i = str.length; i < pad; i++ ) {
	 str += " ";
      }
   }

   return str;
}

/*---------------------------------------------------------------------*/
/*    mean ...                                                         */
/*---------------------------------------------------------------------*/
function mean( times ) {
   if( times.length === 0 ) {
      return -1;
   } else {
      return times.reduce( (a, b) => a + b ) / times.length;
   }
}

/*---------------------------------------------------------------------*/
/*    median ...                                                       */
/*---------------------------------------------------------------------*/
function median( times ) {
   if( times.length === 0 ) {
      return -1;
   } else {
      times.sort( (a, b) => a >= b );
      let tm = times[ times.length / 2 >> 0 ];
      return { tm, min: times[ 0 ], max: times[ times.length - 1 ] };
   }
}

/*---------------------------------------------------------------------*/
/*    deviation ...                                                    */
/*---------------------------------------------------------------------*/
function deviation( times ) {
   if( times.length === 0 ) {
      return -1;
   } else {
      const m = mean( times );
      const c = times.map( v => (v-m) * (v-m) ).reduce( (a, b) => a + b );

      return Math.sqrt( c / times.length );
   }
}
   
/*---------------------------------------------------------------------*/
/*    exports                                                          */
/*---------------------------------------------------------------------*/
exports.padding = padding;
exports.mean = mean;
exports.median = median;
exports.deviation = deviation;
