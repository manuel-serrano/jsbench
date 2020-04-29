#!/bin/bash

toolsdir=`dirname $0`
jsbenchdir=`dirname $toolsdir`
runbenchjs=$jsbenchdir/tools/runbench.js
logbenchjs=$jsbenchdir/tools/logbench.js
engines="hop nodejs jsc"
hopc=hopc

format=
output=
outdir=.

src=

res=

verbose=-v0
extraarg=
namesuf=

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

    -r)
      shift
      inc=`hop --no-server --evaljs "console.log( require( '$1' ).inc )"`
      end=`hop --no-server --evaljs "console.log( require( '$1' ).end )"`
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
      ;;

    -v|-v0|-v1|-v2|-v3|-v4)
      verbose=$1
      ;;

    --namesuf)
      shift
      namesuf=$1
      ;;
    
    --arg)
      shift
      extraarg=$1
      ;;
    
    -*)
      echo "Usage: rangebench.sh [options]" >&2;
      echo "" >&2;
      echo "  -o path         output file" >&2;
      echo "  -D path         output directory" >&2;
      echo "  --hopc path     hopc compiler" >&2;
      echo "  -i rangefile    rangefile" >&2;
      echo "  -e engine       execution engine" >&2;
      echo "  -date date      date" >&2;
      echo "  -m string       message" >&2;
      echo "  -r path         range file (default prog.range.json)" >&2;
      echo "  -v[0123]        verbosity" >&2;
      echo "  --namesuf       name suffix" >&2;
      echo "  --arg           extra program arg" >&2;
      exit 1;;

    *)
      if [ "$src " = " " ]; then
	src=$1
      elif [ "$inc " = " " ]; then
	inc=$1
      elif [ "$end " = " " ]; then
	end=$1
      fi
  esac
  shift
done

tag=`$hopc --buildtag`
tmp=/tmp/JSBENCH/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tag

if [ "$format " = " " ]; then
  if [ "$output " != " " ]; then
    format=`echo $output | awk -F. '{ print $2 }'`
  else
    format=pdf
  fi
fi

mkdir -p $tmp

function run() {
  tmpbench=$tmp/$2.$3
  rm -rf $tmpbench
  mkdir -p $tmpbench

  if [ "$extraarg " != " " ]; then
    echo "hop --sofile-policy none --no-server -- $runbenchjs $verbose -e $1 -T $tmp -D $tmpbench --hopc $hopc --noargsfile --iteration 1 $2 -a $3 -a $extraarg" > /tmp/rangebench.log
    hop --sofile-policy none --no-server -- $runbenchjs $verbose -e $1 -T $tmp -D $tmpbench --hopc $hopc --noargsfile --iteration 1 $2 -a $3 -a $extraarg >> /tmp/rangebench.log
  else
    echo "hop --sofile-policy none --no-server -- $runbenchjs $verbose -e $1 -T $tmp -D $tmpbench --hopc $hopc --noargsfile --iteration 1 $2 -a $3" > /tmp/rangebench.log
    hop --sofile-policy none --no-server -- $runbenchjs $verbose -e $1 -T $tmp -D $tmpbench --hopc $hopc --noargsfile --iteration 1 $2 -a $3 >> /tmp/rangebench.log
  fi

  if [ $? != 0 ]; then
    echo "*** ERROR: bad execution [$?] (see /tmp/rangebench.log)"
    exit 1
  fi

  if [ "`ls -l $tmpbench  | wc -l` " = "1 " ]; then
    echo "*** ERROR: bad execution, no log file produced (see /tmp/rangebench.log)"
    exit 1
  fi

  echo "hop --sofile-policy none --no-server -- $logbenchjs rtimes.js -e $1 $tmpbench" >> /tmp/rangebench.log
  res=`hop --sofile-policy none --no-server -- $logbenchjs rtimes.js -e $1 $tmpbench 2>> /tmp/rangebench.log`

  if [ "$res " = " " ]; then
    echo ""
    echo ""
    echo "*** ERROR: bad run -- $1 $2 $3 (see /tmp/rangebench.log)"
    if [ "$extraarg " != " " ]; then
      echo "hop --sofile-policy none --no-server -- $runbenchjs $verbose -e $1 -T $tmp -D $tmpbench --hopc $hopc --noargsfile --iteration 1 $2 -a $3 -a $extraarg"
    else
      echo "hop --sofile-policy none --no-server -- $runbenchjs $verbose -e $1 -T $tmp -D $tmpbench --hopc $hopc --noargsfile --iteration 1 $2 -a $3"
    fi
    echo "hop --sofile-policy none --no-server -- $logbenchjs rtimes.js -e $1 $tmpbench"
    exit 1
  fi
  
  rm -rf $tmpbench
}

# command line parsing
base=`basename $src .js`
out=$base
dir=`dirname $src`

if [ "$extraarg " != " " ]; then
  out="$base-$extraarg"
fi

case $dir in
  /*)
    root=
    ;;
  *)
    root=./
    ;;
esac

if [ "$output " = " " ]; then
  output=$out.$format
fi

if [ "$inc " = " " ]; then
  if [ -f $dir/$base.range.json ]; then
    inc=`hop --no-server --evaljs "console.log( require( '$root$dir/$base.range.json' ).inc ); process.exit( 0 )"`
    end=`hop --no-server --evaljs "console.log( require( '$root$dir/$base.range.json' ).end ); process.exit( 0 )"`
  else
    inc=100
  fi
fi

if [ "$end " = " " ]; then
  end=`expr $inc "*" 50`;
fi

if [ "$extraarg " != " " ]; then
  echo "$src ($extraarg) inc=$inc end=$end"
else  
  echo "$src inc=$inc end=$end"
fi  

# the csv file
echo "#    $engines" > $outdir/$out.csv

echo -n "  "
i=0

while [ `expr $i "<" $end` = 1 ]; do
  i=`expr $i "+" $inc`
  sep=""

  echo -n "$i "
  echo -n "$i " >> $outdir/$out.csv
  
  for e in $engines; do
    run $e $src $i
    echo -n $sep $res >> $outdir/$out.csv
    sep="; "
  done

  echo "" >> $outdir/$out.csv
done

echo ""

# the plot file
cat > $outdir/$out.plot << EOF
set terminal $format font "Verdana,16"
EOF

echo "set output '$output'" >> $outdir/$out.plot
if [ "$extraarg " != " " ]; then
  echo "set title '$base.js ($extraarg)'" >> $outdir/$out.plot
else  
  echo "set title '$base.js'" >> $outdir/$out.plot
fi  

cat >> $outdir/$out.plot << EOF
set xtics rotate by 90 right font "Verdana,8"
set ytics font "Verdana,12"

set ylabel "execution time (in sec)" offset 0,0
set key left box
set grid

set style line 1 linecolor rgb '#fa9600' linetype 1 linewidth 2 pointsize 1 pointtype 7
set style line 2 linecolor rgb '#109318' linetype 1 linewidth 2 pointsize 1 pointtype 7
set style line 3 linecolor rgb '#3264c8' linetype 1 linewidth 2 pointsize 1 pointtype 7
set style line 4 linecolor rgb '#d83812' linetype 1 linewidth 2 pointsize 1 pointtype 7

EOF

sep="plot"
i=1
for e in $engines; do
  j=`expr $i "+" 1`
  echo -n "$sep '$out.csv' u $j:xtic(1) with line t '$e' ls $i" >> $outdir/$out.plot
  sep=","
  i=$j
done

echo "" >> $outdir/$out.plot

(cd $outdir; gnuplot $out.plot)
