Hop JS benchmarks
=================

To run the benchmarks:

 hop --no-server -- tools/runbench.js -v3 -e hop <dir>
 hop --no-server -- tools/runbench.js -v3 -e hop -e nodejs micro -D /tmp
 hop --no-server -- tools/runbench.js -v3 -e hop -e nodejs octane/richards.js -D /tmp

To run all the "official" benchmarks

 ./hopstone.sh
 ./hopstone.sh --hopc=/tmp/HOP/bin/hopc -m "a message"
 ./hopstone.sh --hopc=/tmp/HOP/bin/hopc -O /tmp/HOPSTONE
 ./hopstone.sh -e hop -e nodejs -O /tmp/HOPSTONE
 ./hopstone.sh -O /tmp/HOPSTONE

To run the benchmarks with Hop only:

 ./hopstone.sh -O /tmp/HOPSTONE -e hop

To run them all shielded

 ./hopstoneshield.sh --hopc=/tmp/HOP/bin/hopc -O /tmp/HOPSTONE

To run hop profile guided optimization

 ./hopstone.sh --hopc=/tmp/HOP/bin/hopc -e hopfprof -O /tmp/HOPSTONE


Hop JS range benchmarks
=======================

To range benchmarks:

  ./hoprange.sh -e hop -e nodejs -O /tmp/HOPRANGE --benchmarks="octane/richards.js octane/deltablue.js octane/boyer.js octane/earley.js octane/splay.js"

To range one benchmark family:

  ./hoprange.sh -e hop -e nodejs -O /tmp/HOPRANGE jetstream
  ./hoprange.sh -e hop -e hopfprof -e nodejs -O /tmp/HOPANGE micro
  ./hoprange.sh -e hop -e hopfprof -e hopcprof -e nodejs -O /tmp/HOPANGE octane

To range hop vs hopold:

  ./hoprange.sh -e hop -e hopold -O /tmp/HOPRANGE micro


Visualization
=============

The visualize a result:

Xgraph
------

 hop --no-server -- tools/logbench.js xgraph.js file1 file2 | xgraph
 hop --no-server -- tools/logbench.js xgraph.js dir1 dir2 | xgraph

ex:

 hop --no-server -- tools/logbench.js xgraph.js LOGS/*arches*/boyer.log.json | xgraph
 hop --no-server -- tools/logbench.js xgraph.js -e hop LOGS/*arches*/boyer.log.json | xgraph

Text (terminal)
---------------

 hop --no-server -- tools/logbench.js text.js file1 file2
 hop --no-server -- tools/logbench.js text.js dir1 dir2
 hop --no-server -- tools/logbench.js summary.js dir1 dir2

ex:

 hop --no-server -- tools/logbench.js text.js LOGS/*arches*/*.log.json
 hop --no-server -- tools/logbench.js text.js -e hop LOGS/*arches*/*.log.json

 
LaTeX
-----

 hop --no-server -- tools/logbench.js latex.js micro


LaTeX relative
--------------

 hop --no-server -- tools/logbench.js latexrel.js micro


Gnuplot
-------

 hop --no-server -- tools/logbench.js gnuplothistogram.js *.log.json
 hop --no-server -- tools/logbench.js gnuplothistogram.js --logscale=y *.log.json
 
 
CPU Shield under Linux
======================

CPU shield enables better performance reproduction

To install (on debian)

  sudo apt install cpuset

To shield one processors

  cset shield --cpu 1

After this processor 0 can be used for monitoring.

To run a shielded program

  cset shield --exec ./a.out -- -arg1 -arg2

To reset the shielding:

  cset shield --reset

To collect runtime statistics

  sudo sh -c "echo -1 > /proc/sys/kernel/perf_event_paranoid"
  perf stat ./a.out

  for permanent perf:

     sudo sh -c "echo "kernel.perf_event_paranoid = -1 >> /etc/sysctl.conf"

To collect shielded runtime statistics

  sudo cset shield --exec /usr/bin/perf -- stat ./a.out

To get even more stable values, PIE can be disabled with:

  sudo echo 0 > /proc/sys/kernel/randomize_va_space
  
To use hopstoneshield.sh
------------------------

hopstoneshield.sh is a mere wrapper that shields 1 processor and executes
hopstone.sh in the shield.

  ./hopstoneshield.sh
  ./hopstoneshield.sh --hopc=/tmp/HOP/bin/hopc -m "a message"
  ./hopstoneshield.sh --hopc=/tmp/HOP/bin/hopc -O /tmp/HOPSTONE

