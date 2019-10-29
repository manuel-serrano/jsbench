#!/bin/bash

# the Hop benchmark suite
. ./hopbench.sh

hopc=hopc
engines="-e hop -e nodejs -e jsc -e js60"

resetengines=""

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

    -e)
      shift;
      if [ "$resetengines " = "no " ]; then
        engines="$engines -e $1";
      else
	resetengines=no;
	engines="-e $1";
      fi
      ;;

    -*)
      echo "Usage: hoprange.sh [options]" >&2;
      echo "" >&2;
      echo "  -O path                            log output base directory" >&2;
      echo "  -m message                         log message (tag)" >&2;
      echo "  --dir=path                         log output directory" >&2;
      echo "  --hopc=path                        hopc compiler" >&2;
      echo "  --benchmarks=prog1 prog2 prog3...  bencharks" >&2;
      echo "  -e engine                          execution engine" >&2;
      exit 1;;

    *)
      BENCHMARKS="`echo $1 | sed 's/^[-a-z]*=//'`";;
  esac
  shift
done

if [ "$dir " = " " -a "$base " = " " ]; then
  tag=`$hopc --buildtag`
  dir=LOGS/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tag
  dt=`date -R`
elif [ "$dir " = " " ]; then
  tag=`$hopc --buildtag`
  dir=$base/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tag
  dt=`date -R`
else
  tag=`$hopc --buildtag`
  dir=LOGS/`date '+%Y-%m-%d-%Hh%M'`-`hostname`-$tag
  dt=`date -R`
fi

mkdir -p $dir

case $BENCHMARKS in
  octane)
    BENCHMARKS=$BENCHMARKS_OCTANE
    ;;
  
  sunspider)
    BENCHMARKS=$BENCHMARKS_SUNSPIDER
    ;;
  
  jetstream)
    BENCHMARKS=$BENCHMARKS_JETSTREAM
    ;;
  
  bglstone)
    BENCHMARKS=$BENCHMARKS_BGLSTONE
    ;;
  
  shootout)
    BENCHMARKS=$BENCHMARKS_SHOOTOUT
    ;;
  
  micro)
    BENCHMARKS=$BENCHMARKS_MICRO
    ;;
  
  other)
    BENCHMARKS=$BENCHMARKS_OTHER
    ;;
  
  proxy)
    BENCHMARKS=$BENCHMARKS_PROXY
    ;;
esac

for p in $BENCHMARKS; do
  if [ "$msg " != " " ]; then
    tools/rangebench.sh -v3 $engines -D $dir $p -m "$msg" --date "$dt" --hopc $hopc
  else
    tools/rangebench.sh $engines -D $dir $p --date "$dt" --hopc $hopc
  fi
done

echo "tools/rangelatex.sh $engines -D $dir --date "$dt" $BENCHMARKS"
tools/rangelatex.sh $engines -D $dir --date "$dt" --tag $tag $BENCHMARKS

echo "See $dir/report.pdf"

