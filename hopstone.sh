#!/bin/sh

# the Hop benchmark suite

BENCHMARKS_OCTANE="octane/richards.js octane/boyer.js octane/earley.js octane/deltablue.js octane/splay.js octane/crypto.js"
BENCHMARKS_SUNSPIDER="sunspider/base64.js"
BENCHMARKS_JETSTREAM="jetstream/crypto-aes.js jetstream/crypto-md5.js jetstream/crypto-sha1.js tagcloud.js jetstream/hash-map.js"
BENCHMARKS_BGLSTONE="bglstone/bague.js bglstone/fib.js bglstone/fib42.js bglstone/puzzle.js bglstone/qsort.js bglstone/sieve.js bglstone/maze.js"
BENCHMARKS_SHOOTOUT="shootout/fannkuch.js shootout/binary-tree.js"
BENCHMARKS_MICRO="micro/assigop.js micro/ctor.js micro/incop.js micro/poly.js micro/set.js micro/callobjhit.js micro/callprotohit.js micro/string.js micro/stridx.js micro/switch.js micro/forinarr.js micro/foreacharr.js"
BENCHMARKS_OTHER="other/deltablue-class.js rho.js"
BENCHMARKS_PROXY="proxy/crypto-proxy.js proxy/boyer-proxy.js proxy/deltablue-proxy.js richards-proxy.js proxy/splay-proxy.js proxy/maze-proxy.js proxy/hash-map-proxy.js proxy/earley-proxy.js proxy/bague-proxy.js proxy/puzzle-proxy.js proxy/crypto-aes-proxy.js proxy/crypo-md5-proxy.js proxy/crypto-sha1-proxy.js proxy/sieve-proxy.js proxy/qsort-proxy.js proxy/splay-proxy.js proxy/binary-tree-proxy.js proxy/fannkuch-proxy.js proxy/base64-proxy.js"
BENCHMARKS_CONTRACT="contract/abbrev.js contract/abs.js contract/app-root-path.js contract/archy.js contract/argv.js"
BENCHMARKS="$BENCHMARKS_OCTANE $BENCHMARKS_SUNSPIDER $BENCHMARKS_JETSTREAM $BENCHMARKS_SHOOTOUT $BENCHMARKS_BGLSTONE $BENCHMARKS_MICRO $BENCHMARKS_PROXY"
hopc=hopc
engines="-e hop -e nodejs -e jsc -e js52 -e js60 -e chakra -e graal"

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
      echo "Usage: hopstone.sh [options]" >&2;
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
  if [ "$msg " != " " ]; then
    hop --no-server -- tools/runbench.js -v3 $engines -D $dir $p -m "$msg" --date "$dt" --hopc $hopc
  else
    hop --no-server -- tools/runbench.js -v3 $engines -D $dir $p --date "$dt" --hopc $hopc
  fi
  sleep $coolperiod
done

hop --no-server -- tools/logbench.js text.js $dir >> $dir/RESULTS.txt

hop --no-server -- tools/logbench.js summary.js $dir > $dir/SUMMARY.txt
cat $dir/SUMMARY.txt

echo "For details, run \"hop --no-server -- tools/logbench.js text.js $dir\""
