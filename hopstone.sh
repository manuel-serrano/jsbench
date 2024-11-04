#!/bin/sh

# the Hop benchmark suite
. ./BENCHMARKS.sh

hopc=hopc
engines="-e hop -e nodejs -e jsc -e js78 -e chakra -e graal"

resetengines=""
compileonly=""
reset=true

while : ; do
  case $1 in
    "")
      break;;

    --dir=*)
      dir="`echo $1 | sed 's/^[-a-z]*=//'`";;

    -O)
      shift;
      base=$1;;

    -m)
      shift;
      msg=$1;;

    --hopc=*)
      hopc="`echo $1 | sed 's/^[-a-z]*=//'`";;

    --shield=*)
      shield="`echo $1 | sed 's/^[-a-z]*=//'`";;

    --benchmarks=*)
      BENCHMARKS="`echo $1 | sed 's/^[-a-z]*=//'`";;

    --compileonly)
      compileonly=--compileonly;;
      
    -e)
      shift;
      if [ "$resetengines " = "no " ]; then
        engines="$engines -e $1";
      else
	resetengines=no;
	engines="-e $1";
      fi
      ;;

    -g)
      hopopt=-g;
      ;;

    -*)
      echo "Usage: hopstone.sh [options]" >&2;
      echo "" >&2;
      echo "  -O path                            log output base directory" >&2;
      echo "  -m message                         log message (tag)" >&2;
      echo "  --dir=path                         log output directory" >&2;
      echo "  --hopc=path                        hopc compiler" >&2;
      echo "  --benchmarks=prog1 prog2 prog3...  bencharks" >&2;
      echo "  -e engine                          execution engine" >&2;
      echo "  -g                                 Hop hopstone debug " >&2;
      exit 1;;

    *)
      if [ "$reset " = "true " ]; then
	reset=false
        BENCHMARKS="`echo $1 | sed 's/^[-a-z]*=//'`"
      else
        BENCHMARKS="$BENCHMARKS `echo $1 | sed 's/^[-a-z]*=//'`"
      fi
      ;;
  esac
  shift
done

if [ "$dir " = " " -a "$base " = " " ]; then
  tags=`$hopc --buildtag`
  dir=LOGS/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tags
  dt=`date -R`
elif [ "$dir " = " " ]; then
  tags=`$hopc --buildtag`
  dir=$base/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tags
  dt=`date -R`
else
  tags=`$hopc --buildtag`
  dir=LOGS/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tags
  dt=`date -R`
fi

coolperiod=3

mkdir -p $dir

for p in $BENCHMARKS; do
  echo "$p..."
  if [ "$msg " != " " ]; then
    hop $hopopt --no-server -- tools/runbench.js -v3 $engines -D $dir $p -m "$msg" --date "$dt" --hopc $hopc $compileonly
  else
    hop $hopopt --no-server -- tools/runbench.js -v3 $engines -D $dir $p --date "$dt" --hopc $hopc $compileonly
  fi
  sleep $coolperiod
done

hop $hopopt --no-server -- tools/logbench.js text.js $dir >> $dir/RESULTS.txt

hop $hopopt --no-server -- tools/logbench.js summary.js $dir > $dir/SUMMARY.txt
cat $dir/SUMMARY.txt

echo "For details, run \"hop --no-server -- tools/logbench.js text.js $dir\""
