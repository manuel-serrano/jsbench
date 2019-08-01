#!/bin/sh

if [ "$1 " = " " ]; then
  echo "usage sudo cset shield ./hopstoneshield.sh -- USER"
  exit 1
fi

/bin/su -l $1 -c /bin/bash -c "cd $PWD; ./hopstone.sh --hopc=$PWD/hopcpatch.sh --dir=/tmp/HOPSTONEOBJ \"--benchmarks=bglstone/sieve.js micro/assigop.js micro/ctor.js micro/incop.js micro/poly.js micro/set.js micro/callobjhit.js micro/callprotohit.js octane/richards.js octane/boyer.js octane/deltablue.js octane/splay.js\""
