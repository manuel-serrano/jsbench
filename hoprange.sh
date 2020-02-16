#!/bin/bash

# the Hop benchmark suite
. ./BENCHMARKS.sh

hopc=hopc
engines="-e hop -e nodejs -e jsc -e js60 -e chakra -e graal"

resetengines=""
verbose=-v0
benchmarks=

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

    -v|-v0|-v1|-v2|-v3|-v4)
      verbose=$1
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
      echo "  -v[0123]                           verbosity" >&2;
      exit 1;;

    *)
      if [ "$benchmarks " = " " ]; then
        benchmarks="`echo $1 | sed 's/^[-a-z]*=//'`"
      else
        benchmarks="$benchmarks `echo $1 | sed 's/^[-a-z]*=//'`"
      fi
      ;;
    
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

if [ "$benchmarks " != " " ]; then
  BENCHMARKS=
  for p in $benchmarks; do
    case $p in
      octane)
	BENCHMARKS="$BENCHMARKS_OCTANE $BENCHMARKS"
	;;
      
      sunspider)
	BENCHMARKS="$BENCHMARKS_SUNSPIDER $BENCHMARKS"
	;;
      
      jetstream)
	BENCHMARKS="$BENCHMARKS_JETSTREAM $BENCHMARKS"
	;;
      
      bglstone)
	BENCHMARKS="$BENCHMARKS_BGLSTONE $BENCHMARKS"
	;;
      
      shootout)
	BENCHMARKS="$BENCHMARKS_SHOOTOUT $BENCHMARKS"
	;;
      
      micro)
	BENCHMARKS="$BENCHMARKS_MICRO $BENCHMARKS"
	;;
      
      other)
	BENCHMARKS="$BENCHMARKS_OTHER $BENCHMARKS"
	;;
      
      proxy)
	BENCHMARKS="$BENCHMARKS_PROXY $BENCHMARKS"
	;;

      *)
	BENCHMARKS="$BENCHMARKS $p"
    esac
  done
fi

echo "engine [$engines] $BENCHMARKS"

for p in $BENCHMARKS; do
  if [ "$msg " != " " ]; then
    tools/rangebench.sh $verbose $engines -D $dir $p -m "$msg" --date "$dt" --hopc $hopc || exit 1
  else
    tools/rangebench.sh $verbose $engines -D $dir $p --date "$dt" --hopc $hopc || exit 1
  fi
done

echo "tools/rangelatex.sh $engines -D $dir --date "$dt" $BENCHMARKS"
tools/rangelatex.sh $engines -D $dir --date "$dt" --tag $tag $BENCHMARKS

echo "See $dir/report.pdf"

