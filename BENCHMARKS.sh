#!/bin/sh

# Hop benchmarks
BENCHMARKS_OCTANE="octane/richards.js octane/boyer.js octane/earley.js octane/deltablue.js octane/splay.js octane/crypto.js"
BENCHMARKS_SUNSPIDER="sunspider/base64.js"
BENCHMARKS_JETSTREAM="jetstream/crypto-aes.js jetstream/crypto-md5.js jetstream/crypto-sha1.js tagcloud.js jetstream/hash-map.js"
BENCHMARKS_BGLSTONE="bglstone/bague.js bglstone/fib.js bglstone/fib42.js bglstone/puzzle.js bglstone/qsort.js bglstone/sieve.js bglstone/maze.js"
BENCHMARKS_SHOOTOUT="shootout/fannkuch.js shootout/binary-tree.js"
BENCHMARKS_MICRO="micro/assigop.js micro/ctor.js micro/ctor2.js micro/incop.js micro/poly.js micro/set.js micro/callobjhit.js micro/callprotohit.js micro/string.js micro/stridx.js micro/switch.js micro/forinarr.js micro/foreacharr.js micro/forofarr.js"
BENCHMARKS_PROXY="proxy/crypto-proxy.js proxy/boyer-proxy.js proxy/deltablue-proxy.js richards-proxy.js proxy/splay-proxy.js proxy/maze-proxy.js proxy/hash-map-proxy.js proxy/earley-proxy.js proxy/bague-proxy.js proxy/puzzle-proxy.js proxy/crypto-aes-proxy.js proxy/crypo-md5-proxy.js proxy/crypto-sha1-proxy.js proxy/sieve-proxy.js proxy/qsort-proxy.js proxy/splay-proxy.js proxy/binary-tree-proxy.js proxy/fannkuch-proxy.js proxy/base64-proxy.js"

BENCHMARKS_OTHER="other/deltablue-class.js rho.js"
BENCHMARKS_CONTRACT="contract/abbrev.js contract/abs.js contract/app-root-path.js contract/archy.js contract/argv.js"

BENCHMARKS="$BENCHMARKS_OCTANE $BENCHMARKS_SUNSPIDER $BENCHMARKS_JETSTREAM $BENCHMARKS_SHOOTOUT $BENCHMARKS_BGLSTONE $BENCHMARKS_MICRO $BENCHMARKS_PROXY"
