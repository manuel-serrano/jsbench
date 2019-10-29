#!/bin/bash

tmp=/tmp/JSBENCH
jsbenchdir=$HOME/prgm/project/hop/jsbench
runbenchjs=$jsbenchdir/tools/runbench.js
logbenchjs=$jsbenchdir/tools/logbench.js
engines="hop nodejs jsc"
hopc=hopc

output=report.tex

srcs=

dt=`date -R`
res=
outdir=.
tag=
width=0.33

resetengines=""

while : ; do
  case $1 in
    "")
      break;;

    --hopc)
      shift
      hopc=$1
      ;;

    -D)
      shift
      outdir=$1
      ;;

    -e)
      shift;
      if [ "$resetengines " = "no " ]; then
        engines="$engines $1";
      else
	resetengines=no;
	engines="$1";
      fi
      ;;

    -o)
      shift
      output=$1
      ;;

    -m)
      shift
      ;;
    
    --date)
      shift
      dt=$1
      ;;

    --tag)
      shift
      tag="($1)"
      ;;

    --width)
      shift
      width=$1
      ;;

    -*)
      echo "Usage: rangebench.sh [options]" >&2;
      echo "" >&2;
      echo "  -o path         output file" >&2;
      echo "  -D path         output directory" >&2;
      echo "  -i rangefile    rangefile" >&2;
      echo "  -e engine       execution engine" >&2;
      echo "  --tag string    hop tag release" >&2;
      echo "  --date date     date of the run" >&2;
      echo "  --width string  chart line width" >&2;
      exit 1;;

    *)
      if [ "$src " = " " ]; then
	srcs="$srcs $1"
      fi
  esac
  shift
done

# the main latex file
cat > $outdir/$output << EOF
\documentclass[a4paper,11pt]{article}
\usepackage{fullpage}

\usepackage{graphicx}
\usepackage{url}
\usepackage{color}
\usepackage{xspace}
EOF

echo "\title{HopRange $tag}" >> $outdir/$output
echo "\author{`hostname` (`uname -m`)}" >> $outdir/$output
echo "\\date{$dt}" >> $outdir/$output

cat >> $outdir/$output << EOF
\begin{document}
\maketitle
EOF

echo "\\noindent " >> $outdir/$output

for p in $srcs; do
  base=`basename $p .js`
  echo "\\includegraphics[width=$width\\linewidth]{$outdir/$base.pdf}" >> $outdir/$output
done

cat >> $outdir/$output << EOF
\end{document}
EOF

(cd $outdir; pdflatex $outdir/$output)
