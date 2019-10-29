#!/bin/bash

tmp=/tmp/JSBENCH
jsbenchdir=$HOME/prgm/project/hop/jsbench
runbenchjs=$jsbenchdir/tools/runbench.js
logbenchjs=$jsbenchdir/tools/logbench.js
engines="hop nodejs jsc"
hopc=hopc

format=
output=
outdir=.

src=

res=

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

if [ "$format " = " " ]; then
  if [ "$output " != " " ]; then
    format=`echo $output | awk -F. '{ print $2 }'`
  else
    format=pdf
  fi
fi

function run() {
  tmpbench=$tmp/$2.$3
  rm -rf $tmpbench
  mkdir -p $tmpbench
  
  hop --sofile-policy none --no-server -- $runbenchjs -s -v0 -e $1 -D $tmpbench --hopc $hopc --iteration 1 $2 -a $3
  res=`hop --sofile-policy none --no-server -- $logbenchjs rtimes.js -e $1 $tmpbench`

  if [ "$res " = " " ]; then
    echo "*** ERROR: bad run -- $1 $2 $3"
    echo "hop --sofile-policy none --no-server -- $runbenchjs -s -v0 -e $1 -D $tmpbench --hopc $hopc --iteration 1 $2 -a $3"
    exit 1
  fi
  
  rm -rf $tmpbench
}

# command line parsing
base=`basename $src .js`
dir=`dirname $src`

exe=$base.out

if [ "$output " = " " ]; then
  output=$base.$format
fi

if [ "$inc " = " " ]; then
  if [ -f $dir/$base.range.json ]; then
    inc=`hop --no-server --evaljs "console.log( require( './$dir/$base.range.json' ).inc ); process.exit( 0 )"`
    end=`hop --no-server --evaljs "console.log( require( './$dir/$base.range.json' ).end ); process.exit( 0 )"`
    echo "inc=$inc end=$end"
  else
    inc=100
  fi
fi

if [ "$end " = " " ]; then
  end=`expr $inc "*" 50`;
fi

echo "$src ($exe) inc=$inc end=$end"
echo "  [$engines]"

# the csv file
echo "#    hop node" > $outdir/$base.csv

echo -n " "
i=0

while [ `expr $i "<" $end` = 1 ]; do
  i=`expr $i "+" $inc`
  sep=""

  echo -n " $i"
  echo -n "$i " >> $outdir/$base.csv
  
  for e in $engines; do
    run $e $src $i
    echo -n $sep $res >> $outdir/$base.csv
    sep="; "
  done

  echo "" >> $outdir/$base.csv
done

echo ""

# the plot file
cat > $outdir/$base.plot << EOF
set terminal $format font "Verdana,16"
EOF

echo "set output '$output'" >> $outdir/$base.plot
echo "set title '$base.js'" >> $outdir/$base.plot

cat >> $outdir/$base.plot << EOF
set xtics rotate by 90 right font "Verdana,8"
set ytics font "Verdana,12"

set ylabel "execution time (in sec)" offset 0,0
set key left box

set style line 1 linecolor rgb '#fa9600' linetype 1 linewidth 2 pointsize 1 pointtype 7
set style line 2 linecolor rgb '#109318' linetype 1 linewidth 2 pointsize 1 pointtype 7
set style line 3 linecolor rgb '#3264c8' linetype 1 linewidth 2 pointsize 1 pointtype 7
set style line 4 linecolor rgb '#d83812' linetype 1 linewidth 2 pointsize 1 pointtype 7

EOF

sep="plot"
i=1
for e in $engines; do
  j=`expr $i "+" 1`
  echo -n "$sep '$base.csv' u $j:xtic(1) with line t '$e' ls $i" >> $outdir/$base.plot
  sep=","
  i=$j
done

echo "" >> $outdir/$base.plot

(cd $outdir; gnuplot $base.plot)
