#!/bin/sh

# Hop benchmarks
BENCHMARKS_OCTANE="octane/richards.js octane/boyer.js octane/earley.js octane/deltablue.js octane/navier-stokes.js octane/splay.js octane/crypto.js octane/raytrace.js"
BENCHMARKS_SUNSPIDER="sunspider/base64.js"
BENCHMARKS_JETSTREAM="jetstream/crypto-aes.js jetstream/crypto-md5.js jetstream/crypto-sha1.js jetstream/tagcloud.js jetstream/hash-map.js jetstream/unipoker.js"
BENCHMARKS_BGLSTONE="bglstone/bague.js bglstone/puzzle.js bglstone/qsort.js bglstone/sieve.js bglstone/sieve-mem.js bglstone/maze.js bglstone/leval.js bglstone/boyer-scm.js bglstone/traverse.js bglstone/earley-scm.js bglstone/almabench.js"
BENCHMARKS_SHOOTOUT="shootout/fannkuch.js shootout/binary-tree.js shootout/n-body.js"
BENCHMARKS_MICRO="micro/assigop.js micro/charat.js micro/ctor.js micro/ctor2.js micro/ctorsmall.js micro/incop.js micro/poly.js micro/set.js micro/callobjhit.js micro/callobjmiss.js micro/callprotohit.js micro/string.js micro/stridx.js micro/switch.js micro/switchstr.js micro/forinarr.js micro/foreacharr.js micro/forofarr.js micro/forofarrlarge.js micro/callclo.js micro/callclo2.js micro/callobjpoly.js micro/assigprop.js micro/arguments.js micro/fib42.js micro/instanceof.js micro/assiginc.js micro/ctorclo.js micro/in.js micro/indyn.js micro/hasownprop.js micro/hasownpropdyn.js micro/getownprop.js micro/getownpropdyn.js micro/totest.js micro/totest2.js micro/genassign.js micro/genfor.js micro/genwhile.js micro/proxy.js micro/bitwise.js micro/regex.js micro/swap.js micro/tryt.js micro/tryf.js"
BENCHMARKS_PROXY="proxy/crypto-proxy.js proxy/boyer-proxy.js proxy/deltablue-proxy.js proxy/richards-proxy.js proxy/splay-proxy.js proxy/maze-proxy.js proxy/hash-map-proxy.js proxy/earley-proxy.js proxy/bague-proxy.js proxy/puzzle-proxy.js proxy/crypto-aes-proxy.js proxy/crypto-md5-proxy.js proxy/crypto-sha1-proxy.js proxy/sieve-proxy.js proxy/qsort-proxy.js proxy/splay-proxy.js proxy/binary-tree-proxy.js proxy/fannkuch-proxy.js proxy/base64-proxy.js"
BENCHMARKS_CONTRACT="contract/abbrev.js contract/abs.js contract/app-root-path.js contract/archy.js contract/argv.js"
BENCHMARKS_OTHER="other/rho.js other/moment.js other/qrcode.js other/basic.js other/uuid.js other/z80.js other/minimist.js other/minimatch.js other/jpeg.js other/js-of-ocaml.js other/marked.js"
BENCHMARKS_CLASS="class/deltablue-class.js class/richards-class.js class/maze-class.js class/chaos.js class/go.js class/hexiom.js class/hexiom-proxy.js class/pyflate.js"

BENCHMARKS="$BENCHMARKS_OCTANE $BENCHMARKS_SUNSPIDER $BENCHMARKS_JETSTREAM $BENCHMARKS_SHOOTOUT $BENCHMARKS_BGLSTONE $BENCHMARKS_MICRO $BENCHMARKS_PROXY $BENCHMARKS_OTHER BENCHMARKS_CLASS"

BENCHMARKS_ICFP21="bglstone/almabench.js bglstone/bague.js other/basic.js bglstone/boyer-scm.js bglstone/earley-scm.js other/jpeg.js other/js-of-ocaml.js bglstone/leval.js other/marked.js bglstone/maze.js other/minimatch.js other/minimist.js other/moment.js other/qrcode.js other/rho.js proxy/richards-proxy.js other/uuid.js other/z80.js"

BENCHMARKS_ASYNC="async/lstat.js async/lstatSync.js async/lstatPromise.js async/readfile.js async/readfileSync.js async/readfilePromise.js async/readfile.js async/readfileSync.js async/readfilePromise.js async/writefile.js async/writefileSync.js async/writefilePromise.js async/ls.js async/lsSync.js async/lsPromise.js async/writebuf.js async/writebufSync.js async/writebufPromise.js "

BENCHMARKS_NAPI="napi/2_function_arguments/2_function_arguments.js napi/3_callbacks/3_callbacks.js napi/4_object_factory/4_object_factory.js napi/5_function_factory/5_function_factory.js napi/test_array/test_array.js napi/test_bigint/test_bigint.js napi/test_constructor/test_constructor.js napi/test_conversion/test_conversion.js napi/test_date/test_date.js napi/test_number/test_number.js"

BENCHMARKS_ARGUMENTS="arguments/apply-escape.js arguments/aref.js arguments/iref.js arguments/length.js arguments/slice.js arguments/spread-slice.js arguments/apply.js arguments/aref_k.js arguments/iref_k.js arguments/length_k.js arguments/spread.js"
