;; hopc -Ox forinobj.js -t foo.scm -- -g2 -gtrace3
(module forinobj
  (eval (library hop)
        (library hopscript)
        (library nodejs))
  (library hop hopscript nodejs)
  (cond-expand (enable-libuv (library libuv)))
  (main main))

(define __js_strings (&begin!))
(%define-cnst-table 2)
(%define-pcache 2)
(hop-sofile-compile-policy-set! 'static)
(define %pcache
  (js-make-pcache-table 2 "forinobj.js"))

(hopjs-standalone-set! #t)
(define %source "forinobj.js")
(define %resource (dirname %source))
(define (main args)
  (bigloo-library-path-set!
    '("/usr/local/lib/hop/3.3.0"
      "."
      "/home/serrano/prgm/project/bigloo/bigloo/lib/bigloo/4.3g"))
  (hopscript-install-expanders!)
  (multiple-value-bind
    (%worker %this %module)
    (js-main-worker!
      "forinobj"
      "/home/serrano/prgm/project/hop/jsbench/micro/forinobj.js"
      #f
      nodejs-new-global-object
      nodejs-new-module)
    (js-worker-push-thunk!
      %worker
      "nodejs-toplevel"
      (let ((|#| (lambda ()
                    (define _ (set! __js_strings (&init!)))
                    (define %cnst-table
                      (js-constant-init
                        (js-cnst-table)
                        "[\001\002[\001\002\001\002[\001\005\"\001\001b\"\001\001c\"\001\001a\"\001\001z\"\001\001w[\001\002\001\002[\001\004\"\001\002b4\"\001\002c3\"\001\001u\"\001\001t"
                        %this))
                   (define %scope (nodejs-new-scope-object %this))
                    (define this
                      (with-access::JsGlobalObject
                        %this
                        (js-object)
                        (js-new0 %this js-object)))
                   (define %evars
                      (with-access::JsModule
                        %module
                        (evars exports checksum)
                        (set! checksum 0)
                        (set! exports (list (vector (& "default") 0 #t)))
                        (set! evars (make-vector 1 (js-undefined)))
                        evars))
                   (define %require
                      (nodejs-require
                        %worker
                        %this
                        %module
                        "hopscript"))
                   (define %import-meta
                      (nodejs-import-meta
                        %worker
                        %this
                        %module
                        "forinobj.js"))
                   (define global
                      (let ((%%tmp %this))
                        (js-define
                          %this
                          %scope
                          (& "global")
                          (lambda (%) global)
                          (lambda (% %v) (set! global %v))
                          %source
                          0)
                        %%tmp))
                   (define GLOBAL
                      (let ((%%tmp %this))
                        (js-define
                          %this
                          %scope
                          (& "GLOBAL")
                          (lambda (%) GLOBAL)
                          (lambda (% %v) (set! GLOBAL %v))
                          %source
                          0)
                        %%tmp))
                   (define !module
                      (let ((%%tmp %module))
                        (js-define
                          %this
                          %scope
                          (& "module")
                          (lambda (%) !module)
                          (lambda (% %v) (set! !module %v))
                          %source
                          0
                          :hidden-class
                          #f)
                        %%tmp))
                   (define !exports
                      (let ((%%tmp (js-get %module (& "exports") %scope)))
                        (js-define
                          %this
                          %scope
                          (& "exports")
                          (lambda (%) !exports)
                          (lambda (% %v) (set! !exports %v))
                          %source
                          0)
                        %%tmp))
                   (define !require
                      (let ((%%tmp %require))
                        (js-define
                          %this
                          %scope
                          (& "require")
                          (lambda (%) !require)
                          (lambda (% %v) (set! !require %v))
                          %source
                          0)
                        %%tmp))
                   (define !HEAD
                      (let ((%%tmp (nodejs-head %worker %this %scope %module)))
                        (js-define
                          %this
                          %scope
                          (& "HEAD")
                          (lambda (%) !HEAD)
                          (lambda (% %v) (set! !HEAD %v))
                          %source
                          0)
                        %%tmp))
                   (define !SCRIPT
                      (let ((%%tmp (nodejs-script
                                     %worker
                                     %this
                                     %scope
                                     %module)))
                        (js-define
                          %this
                          %scope
                          (& "SCRIPT")
                          (lambda (%) !SCRIPT)
                          (lambda (% %v) (set! !SCRIPT %v))
                          %source
                          0)
                        %%tmp))
                   (define !Worker
                      (let ((%%tmp (nodejs-worker %this %scope %module)))
                        (js-define
                          %this
                          %scope
                          (& "Worker")
                          (lambda (%) !Worker)
                          (lambda (% %v) (set! !Worker %v))
                          %source
                          0)
                        %%tmp))
                   (define !__filename
                      (let ((%%tmp (js-get %module (& "filename") %scope)))
                        (js-define
                          %this
                          %scope
                          (& "__filename")
                          (lambda (%) !__filename)
                          (lambda (% %v) (set! !__filename %v))
                          %source
                          0)
                        %%tmp))
                   (define !__dirname
                      (let ((%%tmp (js-string->jsstring
                                     (dirname
                                       (js-jsstring->string
                                         (js-get
                                           %module
                                           (& "filename")
                                           %scope))))))
                        (js-define
                          %this
                          %scope
                          (& "__dirname")
                          (lambda (%) !__dirname)
                          (lambda (% %v) (set! !__dirname %v))
                          %source
                          0)
                        %%tmp))
                   (js-put! GLOBAL (& "global") GLOBAL #f %this)
                    (define !process
                      (let ((%%tmp (nodejs-process %worker %this)))
                        (js-define
                          %this
                          %scope
                          (& "process")
                          (lambda (%) !process)
                          (lambda (% %v) (set! !process %v))
                          %source
                          0)
                        %%tmp))
                   (define !Object
                      (let ((%%tmp (with-access::JsGlobalObject
                                     %this
                                     (js-object)
                                     js-object)))
                        (js-define
                          %this
                          %scope
                          (& "Object")
                          (lambda (%) !Object)
                          (lambda (% %v) (set! !Object %v))
                          %source
                          0)
                        %%tmp))
                   (define !Array
                      (let ((%%tmp (with-access::JsGlobalObject
                                     %this
                                     (js-array)
                                     js-array)))
                        (js-define
                          %this
                          %scope
                          (& "Array")
                          (lambda (%) !Array)
                          (lambda (% %v) (set! !Array %v))
                          %source
                          0)
                        %%tmp))
                   (define !String
                      (let ((%%tmp (with-access::JsGlobalObject
                                     %this
                                     (js-string)
                                     js-string)))
                        (js-define
                          %this
                          %scope
                          (& "String")
                          (lambda (%) !String)
                          (lambda (% %v) (set! !String %v))
                          %source
                          0)
                        %%tmp))
                   (define !RegExp
                      (let ((%%tmp (with-access::JsGlobalObject
                                     %this
                                     (js-regexp)
                                     js-regexp)))
                        (js-define
                          %this
                          %scope
                          (& "RegExp")
                          (lambda (%) !RegExp)
                          (lambda (% %v) (set! !RegExp %v))
                          %source
                          0)
                        %%tmp))
                   (define !Proxy
                      (let ((%%tmp (with-access::JsGlobalObject
                                     %this
                                     (js-proxy)
                                     js-proxy)))
                        (js-define
                          %this
                          %scope
                          (& "Proxy")
                          (lambda (%) !Proxy)
                          (lambda (% %v) (set! !Proxy %v))
                          %source
                          0)
                        %%tmp))
                   (define !Math
                      (let ((%%tmp (with-access::JsGlobalObject
                                     %this
                                     (js-math)
                                     js-math)))
                        (js-define
                          %this
                          %scope
                          (& "Math")
                          (lambda (%) !Math)
                          (lambda (% %v) (set! !Math %v))
                          %source
                          0)
                        %%tmp))
                   (define !console
                      (let ((%%tmp (nodejs-require-core
                                     "console"
                                     %worker
                                     %this)))
                        (js-define
                          %this
                          %scope
                          (& "console")
                          (lambda (%) !console)
                          (lambda (% %v) (set! !console %v))
                          %source
                          0)
                        %%tmp))
                   (define !hop
                      (let ((%%tmp (nodejs-require-core "hop" %worker %this)))
                        (js-define
                          %this
                          %scope
                          (& "hop")
                          (lambda (%) !hop)
                          (lambda (% %v) (set! !hop %v))
                          %source
                          0)
                        %%tmp))
                   (nodejs-eval %this %scope)
                    (nodejs-function %this %scope)
                    (nodejs-bind-export!
                      %this
                      %scope
                      (nodejs-require-core "buffer" %worker %this)
                      (& "Buffer"))
                    (nodejs-bind-export!
                      %this
                      %scope
                      (nodejs-require-core "timers" %worker %this)
                      (& "clearImmediate")
                      (& "clearInterval")
                      (& "clearTimeout")
                      (& "setImmediate")
                      (& "setInterval")
                      (& "setTimeout"))
                    (js-undefined)
                    (define ^default (js-undefined))
                    (define (@t)
                      (let* ((^a::JsObject
                               (with-access::JsGlobalObject
                                 %this
                                 (__proto__)
                                 (instantiateJsObject
                                   (cmap (js-cnst-table-ref 0))
                                   (__proto__ __proto__)
                                   (elements (vector 3 4 1 10 -1)))))
                             (^b::JsObject
                               (with-access::JsGlobalObject
                                 %this
                                 (__proto__)
                                 (instantiateJsObject
                                   (cmap (js-cnst-table-ref 1))
                                   (__proto__ __proto__)
                                   (elements (vector 35 47 -19 -1)))))
                             (^r::obj (js-undefined)))
                        (let ((%Ii::uint32 #u32:0))
                          (let for@forinobj.js:263
                            ()
                            (if (<u32 %Ii #u32:1000000)
                              (begin
                                (let ((^i::uint32 %Ii))
                                  (set! ^r
                                    (bind-exit
                                      (%return1030)
                                      (let ((^a1029::JsObject ^a))
                                        (let ((%Ii::obj (js-undefined)))
                                          (js-for-in
                                            ^a1029
                                            (lambda (g1038 %this)
                                               (set! %Ii g1038)
                                               (let ((^i::obj %Ii))
                                                 (set! ^r
                                                   (let* ((lhs1033::obj ^r)
                                                          (rhs1034::obj
                                                            (js-jsobject-get/name-cache
                                                              ^a1029
                                                              ^i
                                                              %this
                                                              113
                                                              '(imap emap
                                                                     cmap
                                                                     pmap
                                                                     amap
                                                                     vtable)
                                                              "forinobj.js")))
                                                     (if (fixnums?
                                                           lhs1033
                                                           rhs1034)
                                                       (+fx/overflow
                                                         lhs1033
                                                         rhs1034)
                                                       (if (and (flonum?
                                                                  lhs1033)
                                                                (flonum?
                                                                  rhs1034))
                                                         (+fl lhs1033 rhs1034)
                                                         (js+ lhs1033
                                                              rhs1034
                                                              %this)))))))
                                            %this)
                                          (%return1030 ^r)))))
                                  (set! ^r
                                    (bind-exit
                                      (%return1032)
                                      (let ((^a1031::JsObject ^b))
                                        (let ((%Ii::obj (js-undefined)))
                                          (js-for-in
                                            ^a1031
                                            (lambda (g1039 %this)
                                               (set! %Ii g1039)
                                               (let ((^i::obj %Ii))
                                                 (set! ^r
                                                   (let* ((lhs1035::obj ^r)
                                                          (rhs1036::obj
                                                            (js-jsobject-get/name-cache
                                                              ^a1031
                                                              ^i
                                                              %this
                                                              113
                                                              '(imap emap
                                                                     cmap
                                                                     pmap
                                                                     amap
                                                                     vtable)
                                                              "forinobj.js")))
                                                     (if (fixnums?
                                                           lhs1035
                                                           rhs1036)
                                                       (+fx/overflow
                                                         lhs1035
                                                         rhs1036)
                                                       (if (and (flonum?
                                                                  lhs1035)
                                                                (flonum?
                                                                  rhs1036))
                                                         (+fl lhs1035 rhs1036)
                                                         (js+ lhs1035
                                                              rhs1036
                                                              %this)))))))
                                            %this)
                                          (%return1032 ^r)))))
                                  (set! %Ii ^i))
                                (let ((prev1037 %Ii))
                                  (begin (set! %Ii (+u32 %Ii #u32:1)) prev1037))
                                (for@forinobj.js:263))
                              (js-undefined))))
                        ^r))
                   (define ^r 0)
                    (& "use strict")
                    (js-call2
                      %this
                      (js-get !console (& "log") %this)
                      !console
                      (& "run=")
                      (@t))
                    (vector-set!
                      %evars
                      0
                      (js-get !module (& "exports") %this))
                    (vector-ref %evars 0))))
        |#|))
    #f
    (thread-join! %worker)))

(&end!)
