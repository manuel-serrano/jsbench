To compile and run with Node:

  npm install
  nodejs bench.js
  
To compile and with with Hop:

  gcc -I$HOME/prgm/project/hop/hop/nodejs -I$HOME/prgm/project/bigloo/bigloo/lib/bigloo/4.5b -shared ../entry_point.c 2_function_arguments.c -o build/Release/2_function_arguments.node -Wl,-soname=2_function_arguments.so -fPIC -Wl,--enable-new-dtags,-rpath=/usr/local/lib/hop/3.6.0 -Wl,--enable-new-dtags,-rpath=/home/serrano/prgm/project/bigloo/bigloo/lib/bigloo/4.5b -L/home/serrano/prgm/project/bigloo/bigloo/lib/bigloo/4.5b -L/home/serrano/prgm/project/hop/hop/lib/hop/3.6.0 -L/home/serrano/prgm/project/bigloo/bigloo/lib/bigloo/4.5b  -rdynamic -ldl -lresolv -lunistring -lpcre2-8 -lgmp -lm -lc -lbigloo_s_mt-4.5b -lbiglooweb_s_mt-4.5b -lbigloomultimedia_s_mt-4.5b -lbiglooopenpgp_s_mt-4.5b -lbigloossl_s_mt-4.5b -lbigloopthread_s_mt-4.5b -lbiglooavahi_s_mt-4.5b -lbiglooupnp_s_mt-4.5b -lbigloolibuv_s_mt-4.5b -ljs2scheme_s_mt-3.6.0 -lhop_s_mt-3.6.0 -lhopscript_s_mt-3.6.0 -lnodejs_s_mt-3.6.0 -lhopwidget_s_mt-3.6.0 -lbigloogc_mt-4.5b
  hopc -Ox bench.js
  ./a.out
