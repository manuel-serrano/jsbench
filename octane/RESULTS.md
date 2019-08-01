Benchmarks measures
===================

nodejs 4.72, v8 4.5.103



Richards
--------

hopc -Ox -m64 richards.js

#### reference:

  nodejs, redrock:    1.14s
  nodejs, moab:       3.09s     
  nodejs, arches:     3.30s
  

#### 2017-02-03
  08h06, redrock:     27.64s           (x24)
  15h40, redrock:     26.60s           (x23.3)


#### 2017-02-04
  11h29, moab:        43.42s [33.87MB] (x14)


#### 2017-02-05
  08h57, moab:        41.87s           (x13.55) ;; inline js-put-name/cache
  11h00, moab:        39.72s           (x12.85) ;; this type inference
  11h40, moab:        39.62s [30.40MB] (x12.85) ;; constr size
  12h27, moab:        38.37s           (x12.41)
  12h36, moab:        37.56s           (x12.15) ;; && and || to-bool
  19h32, moab:        36.05s           (x11.66) ;; bit-and, bit-or


### 2017-02-06
  07h48, redrock:     21.94s           (x19.24)


### 2017-02-07
  09h21, redrock:     12.06s           (x10.57) ;; constructor prototype
  09h35, arches:      18.00s           (x5.45)
  13h35, redrock:     11.74s           (x10.29)
  16h38, redrock:     11.24s           (x9.77)  ;; js-get-symbol-name/cache-miss
  18h56, moab:        14.70s           (x4.75)  ;; js-call
  19h12, moab/clang:  14.02s           (x4.24)

### 2017-02-15
  17h52, arches       13.74s           (x4.16)

### 2017-02-17
  18h46, arches       12.69s           (x3.85)
  
### 2017-02-18
  07h45, moab         12.79s           (x4.13)  ;; !! sans test this isa? obj
  09h41, moab         11.25s           (x3.64)  ;; !! sans test this isa? obj
  
### 2017-02-19
  06h59, moab         11.14s           (x3.60)  ;; !! sans test this isa? obj
  06h59, moab         12.81s           (x4.15)  ;; avec test this isa? obj
  07h41, moab         10.66s           (x3.44)  ;; -fisa
  
### 2017-02-26
  19h20, moab         10.45s           (x3.16)
  
### 2017-02-27
  08h33, arches       10.27s           (x3.11)  ;; single threaded
  
### 2017-03-05
  07h11, moab         10.66s           (x3.44)  ;; new property
  07h11, moab          9.79s           (x3.17)  ;; new property + ccall
  
### 2017-03-07
  07h28, redrock       7.35s           (x6.44)  ;; -fccall

### 2017-03-09
  15h45, arches        8.44s           (x2.55)  ;; -Ox -m64 [st]
  
### 2017-03-14
  08h51, arches        7.91s           (x2.40)  ;; vtables [mt]          

### 2017-03-17
  17h51, moab          9.72s           (x3.09)  ;; [mt]          

### 2017-03-20
  20h41, moab          9.01s           (x2.91)  ;; [mt]          

### 2017-03-20
  20h41, moab          8.93s           (x2.89)  ;; [st]          

### 2017-03-24
  08h44, redrock       6.40s           (x5.61)  ;; [mt]

### 2017-03-30
  11h44, redrock       5.83s           (x5.11)  ;; [mt]

### 2017-04-02
  09h20, arches        7.78s           (x2.35)  ;; [st] (inc & assign cache)

### 2017-04-05
  15h12, arches        7.10s           (x2.15)  ;; [mt] (inc & assign cache)

### 2017-04-05
  15h12, moab          8.25s           (x2.67)  ;; [mt] (inc & assign cache)

### 2017-04-08
  17h45, moab          8.12s           (x2.62)  ;; [mt] (inc & assign cache)


Crypto
------

hopc -Ox crypto.js

#### reference:

  nodejs, redrock:    
  nodejs, arches:     3.43s
  nodejs, moab:       2.31s

### 2017-04-02
  09h15, moab       110.74s            (x32.28) ;; [mt]          


Deltablue
---------

hopc -Ox -m64 deltablue.js

#### reference:

  nodejs, redrock:    0.71s
  nodejs, arches:     2.42s
  nodejs, moab:       2.31s

#### 2017-02-22
  08h00, redrock      42.04s           (x59.21)

#### 2017-02-23
  07h31, redrock      24.32s           (x35.25)
  08h24, redrock      23.24s           (x33.20)

### 2017-02-24
  07h45, arches       26.06s           (x10.76)
  
### 2017-02-26
  06h22, moab         28.78s           (x12.46)
  06h34, moab         28.18s           (x12.19) ;; new array
  08h16, moab         28.08s           (x12.15) ;; fast-new 
  19h20, moab         25.26s           (x10.93) ;; Object.__proto__

### 2017-02-27
  08h33, arches       19.87s           (x8.21)  ;; single threaded
  14h51, redrock      13.42s           (x18.90) ;; single threaded
  16h31, redrock      12.72s           (x18.90) ;; array js-toindex
  16h31, arches       19.36s           (x8.00)  ;; array js-toindex

### 2017-03-05
  17h42, moab         17.29s           (x7.48)  ;; new property + ccall
  
### 2017-03-07
  08h00, redrock      13.27s           (x18.69) ;; -fccall
  08h30, arches       15.30s           (x6.32)  

### 2017-03-08
  13h19, arches       13.88s           (x5.73)  ;; -Ox -m64 [st]

### 2017-03-09
  09h29, redrock      11.95s           (x16.59) ;; -Ox [mt]
  15h03, arches       14.70s           (x6.07)  ;; -Ox -m64 [mt]
  15h45, arches       13.82s           (x5.71)  ;; -Ox -m64 [mt]
  15h45, arches       12.30s           (x5.08)  ;; -Ox -m64 [st]

### 2017-03-14
  08h51, arches       11.31s           (x4.67)  ;; vtables [mt]          
  15h53, arches       10.99s           (x4.54)  ;; [mt]          

### 2017-03-17
  17h51, moab         12.65s           (x5.47)  ;; [mt]          

### 2017-03-20
  20h41, moab         12.48s           (x5.40)  ;; [mt]          

### 2017-03-24
  08h44, redrock      11.33s           (x15.95) ;; [mt]          

### 2017-03-30
  11h44, redrock       9.18s           (x12.92) ;; [mt]
  
### 2017-04-02
  09h15, moab         12.48s           (x5.40)  ;; [mt]          

### 2017-04-08
  17h45, moab         11.87s           (x5.13)  ;; [mt]
