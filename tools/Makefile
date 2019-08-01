#*=====================================================================*/
#*    serrano/prgm/project/hop/jsbench/tools/Makefile                  */
#*    -------------------------------------------------------------    */
#*    Author      :  Manuel Serrano                                    */
#*    Creation    :  Mon Apr 17 19:43:53 2017                          */
#*    Last change :  Mon Jul 31 08:31:24 2017 (serrano)                */
#*    Copyright   :  2017 Manuel Serrano                               */
#*    -------------------------------------------------------------    */
#*    jsbench Makefile                                                 */
#*=====================================================================*/

HOPC=hopc

bin/runbench: runbench.js
	$(HOPC) -O3 $< -o $@

bin/logbench: logbench.js
	$(HOPC) -O3 $< -o $@

clean:
	$(RM) bin/runbench bin/runbench.o
	$(RM) bin/logbench bin/logbench.o
