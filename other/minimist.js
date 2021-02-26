/*=====================================================================*/
/*    serrano/trashcan/minimist/minimist.js                            */
/*    -------------------------------------------------------------    */
/*    Author      :  Manuel Serrano                                    */
/*    Creation    :  Thu Oct  1 13:36:01 2020                          */
/*    Last change :  Thu Oct  1 13:50:11 2020 (serrano)                */
/*    Copyright   :  2020-21 Manuel Serrano                            */
/*    -------------------------------------------------------------    */
/*    minimist benchmark                                               */
/*    -------------------------------------------------------------    */
/*    https://www.npmjs.com/package/minimis                            */
/*=====================================================================*/
"use strict";

/*---------------------------------------------------------------------*/
/*    assert                                                           */
/*---------------------------------------------------------------------*/
function assert( v ) {
   if( !v ) throw( "assert error" );
}

assert.strictEqual = ( x, y ) => x === y;

function equal( x, y ) {
   if( x === y ) return true;
   if( typeof x !== typeof y ) throw( "assert.deepEqual error" );
   if( x instanceof Array ) {
      for( let i = x.length - 1; i >= 0; i-- ) {
	 if( x[ i ] !== y[ i ] ) throw( "asser.deepEqual error" );
      }
   }
}
   
assert.equal = equal;
assert.same = equal;

function deepEqual( x, y ) {
   if( x === y ) return true;
   if( typeof x !== typeof y ) throw( "assert.deepEqual error" );
   if( x instanceof Array ) {
      for( let i = x.length - 1; i >= 0; i-- ) {
	 if( !deepEqual( x[ i ], y[ i ] ) ) throw( "asser.deepEqual error" );
      }
   }
}
   
assert.deepEqual = deepEqual;

assert.throws = function( thunk ) {
   try {
      thunk();
      throw( "assert.throws error" );
   } catch( _ ) {
      return true;
   }
}

assert.ok = function( x ) { return x === true };

assert.end = function() { return true; }

assert.plan = function( n ) { return undefined; }

/*---------------------------------------------------------------------*/
/*    minimist ...                                                     */
/*---------------------------------------------------------------------*/
function parse(args, opts) {
    if (!opts) opts = {};
    
    var flags = { bools : {}, strings : {}, unknownFn: null };

    if (typeof opts['unknown'] === 'function') {
        flags.unknownFn = opts['unknown'];
    }

    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
      flags.allBools = true;
    } else {
      [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
          flags.bools[key] = true;
      });
    }
    
    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key) {
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(function (x) {
            aliases[x] = [key].concat(aliases[key].filter(function (y) {
                return x !== y;
            }));
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(function (key) {
        flags.strings[key] = true;
        if (aliases[key]) {
            flags.strings[aliases[key]] = true;
        }
     });

    var defaults = opts['default'] || {};
    
    var argv = { _ : [] };
    Object.keys(flags.bools).forEach(function (key) {
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });
    
    var notFlags = [];

    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--')+1);
        args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg)) ||
            flags.strings[key] || flags.bools[key] || aliases[key];
    }

    function setArg (key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        var value = !flags.strings[key] && isNumber(val)
            ? Number(val) : val
        ;
        setKey(argv, key.split('.'), value);
        
        (aliases[key] || []).forEach(function (x) {
            setKey(argv, x.split('.'), value);
        });
    }

    function setKey (obj, keys, value) {
        var o = obj;
        for (var i = 0; i < keys.length-1; i++) {
            var key = keys[i];
            if (key === '__proto__') return;
            if (o[key] === undefined) o[key] = {};
            if (o[key] === Object.prototype || o[key] === Number.prototype
                || o[key] === String.prototype) o[key] = {};
            if (o[key] === Array.prototype) o[key] = [];
            o = o[key];
        }

        var key = keys[keys.length - 1];
        if (key === '__proto__') return;
        if (o === Object.prototype || o === Number.prototype
            || o === String.prototype) o = {};
        if (o === Array.prototype) o = [];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
            o[key] = value;
        }
        else if (Array.isArray(o[key])) {
            o[key].push(value);
        }
        else {
            o[key] = [ o[key], value ];
        }
    }
    
    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
          return flags.bools[x];
      });
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        
        if (/^--.+=/.test(arg)) {
            // Using [\s\S] instead of . because js doesn't support the
            // 'dotall' regex modifier. See:
            // http://stackoverflow.com/a/1068308/13216
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            var key = m[1];
            var value = m[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        }
        else if (/^--no-.+/.test(arg)) {
            var key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        }
        else if (/^--.+/.test(arg)) {
            var key = arg.match(/^--(.+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !/^-/.test(next)
            && !flags.bools[key]
            && !flags.allBools
            && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            }
            else if (/^(true|false)$/.test(next)) {
                setArg(key, next === 'true', arg);
                i++;
            }
            else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        }
        else if (/^-[^-]+/.test(arg)) {
            var letters = arg.slice(1,-1).split('');
            
            var broken = false;
            for (var j = 0; j < letters.length; j++) {
                var next = arg.slice(j+2);
                
                if (next === '-') {
                    setArg(letters[j], next, arg)
                    continue;
                }
                
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split('=')[1], arg);
                    broken = true;
                    break;
                }
                
                if (/[A-Za-z]/.test(letters[j])
                && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                
                if (letters[j+1] && letters[j+1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j+2), arg);
                    broken = true;
                    break;
                }
                else {
                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
                }
            }
            
            var key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])
                && !flags.bools[key]
                && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i+1], arg);
                    i++;
                }
                else if (args[i+1] && /^(true|false)$/.test(args[i+1])) {
                    setArg(key, args[i+1] === 'true', arg);
                    i++;
                }
                else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        }
        else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(
                    flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
                );
            }
            if (opts.stopEarly) {
                argv._.push.apply(argv._, args.slice(i + 1));
                break;
            }
        }
    }
    
    Object.keys(defaults).forEach(function (key) {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            
            (aliases[key] || []).forEach(function (x) {
                setKey(argv, x.split('.'), defaults[key]);
            });
        }
    });
    
    if (opts['--']) {
        argv['--'] = new Array();
        notFlags.forEach(function(key) {
            argv['--'].push(key);
        });
    }
    else {
        notFlags.forEach(function(key) {
            argv._.push(key);
        });
    }

    return argv;
};

function hasKey (obj, keys) {
    var o = obj;
    keys.slice(0,-1).forEach(function (key) {
        o = (o[key] || {});
    });

    var key = keys[keys.length - 1];
    return key in o;
}

function isNumber (x) {
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

/*---------------------------------------------------------------------*/
/*    test ...                                                         */
/*---------------------------------------------------------------------*/
let verbOn = true;

function test( msg, proc ) {
   if( verbOn ) console.log( msg, "..." );
   proc( assert );
}

/*---------------------------------------------------------------------*/
/*    allBool.js                                                       */
/*---------------------------------------------------------------------*/
function allBool() {
   test('flag boolean true (default all --args to boolean)', function (t) {
    var argv = parse(['moo', '--honk', 'cow'], {
        boolean: true
    });
    
    t.deepEqual(argv, {
        honk: true,
        _: ['moo', 'cow']
    });
    
    t.deepEqual(typeof argv.honk, 'boolean');
    t.end();
});

test('flag boolean true only affects double hyphen arguments without equals signs', function (t) {
    var argv = parse(['moo', '--honk', 'cow', '-p', '55', '--tacos=good'], {
        boolean: true
    });
    
    t.deepEqual(argv, {
        honk: true,
        tacos: 'good',
        p: 55,
        _: ['moo', 'cow']
    });
    
    t.deepEqual(typeof argv.honk, 'boolean');
    t.end();
});
}

/*---------------------------------------------------------------------*/
/*    bool.js                                                          */
/*---------------------------------------------------------------------*/
function bool() {
   test('flag boolean default false', function (t) {
      var argv = parse(['moo'], {
         boolean: ['t', 'verbose'],
default: { verbose: false, t: false }
      });
      
      t.deepEqual(argv, {
         verbose: false,
         t: false,
         _: ['moo']
      });
      
      t.deepEqual(typeof argv.verbose, 'boolean');
      t.deepEqual(typeof argv.t, 'boolean');
      t.end();

   });

   test('boolean groups', function (t) {
      var argv = parse([ '-x', '-z', 'one', 'two', 'three' ], {
         boolean: ['x','y','z']
      });
      
      t.deepEqual(argv, {
         x : true,
         y : false,
         z : true,
         _ : [ 'one', 'two', 'three' ]
      });
      
      t.deepEqual(typeof argv.x, 'boolean');
      t.deepEqual(typeof argv.y, 'boolean');
      t.deepEqual(typeof argv.z, 'boolean');
      t.end();
   });
   test('boolean and alias with chainable api', function (t) {
      var aliased = [ '-h', 'derp' ];
      var regular = [ '--herp',  'derp' ];
      var opts = {
         herp: { alias: 'h', boolean: true }
      };
      var aliasedArgv = parse(aliased, {
         boolean: 'herp',
         alias: { h: 'herp' }
      });
      var propertyArgv = parse(regular, {
         boolean: 'herp',
         alias: { h: 'herp' }
      });
      var expected = {
         herp: true,
         h: true,
         '_': [ 'derp' ]
      };
      
      t.same(aliasedArgv, expected);
      t.same(propertyArgv, expected); 
      t.end();
   });

   test('boolean and alias with options hash', function (t) {
      var aliased = [ '-h', 'derp' ];
      var regular = [ '--herp', 'derp' ];
      var opts = {
         alias: { 'h': 'herp' },
         boolean: 'herp'
      };
      var aliasedArgv = parse(aliased, opts);
      var propertyArgv = parse(regular, opts);
      var expected = {
         herp: true,
         h: true,
         '_': [ 'derp' ]
      };
      t.same(aliasedArgv, expected);
      t.same(propertyArgv, expected);
      t.end();
   });

   test('boolean and alias array with options hash', function (t) {
      var aliased = [ '-h', 'derp' ];
      var regular = [ '--herp', 'derp' ];
      var alt = [ '--harp', 'derp' ];
      var opts = {
         alias: { 'h': ['herp', 'harp'] },
         boolean: 'h'
      };
      var aliasedArgv = parse(aliased, opts);
      var propertyArgv = parse(regular, opts);
      var altPropertyArgv = parse(alt, opts);
      var expected = {
         harp: true,
         herp: true,
         h: true,
         '_': [ 'derp' ]
      };
      t.same(aliasedArgv, expected);
      t.same(propertyArgv, expected);
      t.same(altPropertyArgv, expected);
      t.end();
   });

   test('boolean and alias using explicit true', function (t) {
      var aliased = [ '-h', 'true' ];
      var regular = [ '--herp',  'true' ];
      var opts = {
         alias: { h: 'herp' },
         boolean: 'h'
      };
      var aliasedArgv = parse(aliased, opts);
      var propertyArgv = parse(regular, opts);
      var expected = {
         herp: true,
         h: true,
         '_': [ ]
      };

      t.same(aliasedArgv, expected);
      t.same(propertyArgv, expected); 
      t.end();
   });

   // regression, see https://github.com/substack/node-optimist/issues/71
   test('boolean and --x=true', function(t) {
      var parsed = parse(['--boool', '--other=true'], {
         boolean: 'boool'
      });

      t.same(parsed.boool, true);
      t.same(parsed.other, 'true');

      parsed = parse(['--boool', '--other=false'], {
         boolean: 'boool'
      });
      
      t.same(parsed.boool, true);
      t.same(parsed.other, 'false');
      t.end();
   });

   test('boolean --boool=true', function (t) {
      var parsed = parse(['--boool=true'], {
default: {
       boool: false
    },
        boolean: ['boool']
    });

    t.same(parsed.boool, true);
    t.end();
});

test('boolean --boool=false', function (t) {
    var parsed = parse(['--boool=false'], {
        default: {
          boool: true
        },
        boolean: ['boool']
    });

    t.same(parsed.boool, false);
    t.end();
});

test('boolean using something similar to true', function (t) {
    var opts = { boolean: 'h' };
    var result = parse(['-h', 'true.txt'], opts);
    var expected = {
        h: true,
        '_': ['true.txt']
    };

    t.same(result, expected);
    t.end();
});
}

/*---------------------------------------------------------------------*/
/*    dash.js ...                                                      */
/*---------------------------------------------------------------------*/
function dash() {
   test('-', function (t) {
      t.plan(5);
      t.deepEqual(parse([ '-n', '-' ]), { n: '-', _: [] });
      t.deepEqual(parse([ '-' ]), { _: [ '-' ] });
      t.deepEqual(parse([ '-f-' ]), { f: '-', _: [] });
      t.deepEqual(
         parse([ '-b', '-' ], { boolean: 'b' }),
         { b: true, _: [ '-' ] }
    	 );
      t.deepEqual(
         parse([ '-s', '-' ], { string: 's' }),
         { s: '-', _: [] }
    	 );
   });

   test('-a -- b', function (t) {
      t.plan(3);
      t.deepEqual(parse([ '-a', '--', 'b' ]), { a: true, _: [ 'b' ] });
      t.deepEqual(parse([ '--a', '--', 'b' ]), { a: true, _: [ 'b' ] });
      t.deepEqual(parse([ '--a', '--', 'b' ]), { a: true, _: [ 'b' ] });
   });

   test('move arguments after the -- into their own `--` array', function(t) {
      t.plan(1);
      t.deepEqual(
         parse([ '--name', 'John', 'before', '--', 'after' ], { '--': true }),
         { name: 'John', _: [ 'before' ], '--': [ 'after' ] });
   });
}

/*---------------------------------------------------------------------*/
/*    defaultBool ...                                                  */
/*---------------------------------------------------------------------*/
function defaultBool() {
   test('boolean default true', function (t) {
      var argv = parse([], {
         boolean: 'sometrue',
default: { sometrue: true }
      });
      t.equal(argv.sometrue, true);
      t.end();
   });

   test('boolean default false', function (t) {
      var argv = parse([], {
         boolean: 'somefalse',
default: { somefalse: false }
      });
      t.equal(argv.somefalse, false);
      t.end();
   });

   test('boolean default to null', function (t) {
      var argv = parse([], {
         boolean: 'maybe',
default: { maybe: null }
      });
      t.equal(argv.maybe, null);
      var argv = parse(['--maybe'], {
         boolean: 'maybe',
default: { maybe: null }
      });
      t.equal(argv.maybe, true);
      t.end();

   })
}

/*---------------------------------------------------------------------*/
/*    dotted ...                                                       */
/*---------------------------------------------------------------------*/
function dotted() {
   test('dotted alias', function (t) {
      var argv = parse(['--a.b', '22'], {default: {'a.b': 11}, alias: {'a.b': 'aa.bb'}});
      t.equal(argv.a.b, 22);
      t.equal(argv.aa.bb, 22);
      t.end();
   });

   test('dotted default', function (t) {
      var argv = parse('', {default: {'a.b': 11}, alias: {'a.b': 'aa.bb'}});
      t.equal(argv.a.b, 11);
      t.equal(argv.aa.bb, 11);
      t.end();
   });

   test('dotted default with no alias', function (t) {
      var argv = parse('', {default: {'a.b': 11}});
      t.equal(argv.a.b, 11);
      t.end();
   });
}

/*---------------------------------------------------------------------*/
/*    kv_short.js ...                                                  */
/*---------------------------------------------------------------------*/
function kv_short() {
   test('short -k=v' , function (t) {
      t.plan(1);
      
      var argv = parse([ '-b=123' ]);
      t.deepEqual(argv, { b: 123, _: [] });
   });

   test('multi short -k=v' , function (t) {
      t.plan(1);
      
      var argv = parse([ '-a=whatever', '-b=robots' ]);
      t.deepEqual(argv, { a: 'whatever', b: 'robots', _: [] });
   });
}

/*---------------------------------------------------------------------*/
/*    long.js ...                                                      */
/*---------------------------------------------------------------------*/
function long() {
   test('long opts', function (t) {
      t.deepEqual(
         parse([ '--bool' ]),
         { bool : true, _ : [] },
         'long boolean'
    	 );
      t.deepEqual(
         parse([ '--pow', 'xixxle' ]),
         { pow : 'xixxle', _ : [] },
         'long capture sp'
    	 );
      t.deepEqual(
         parse([ '--pow=xixxle' ]),
         { pow : 'xixxle', _ : [] },
         'long capture eq'
    	 );
      t.deepEqual(
         parse([ '--host', 'localhost', '--port', '555' ]),
         { host : 'localhost', port : 555, _ : [] },
         'long captures sp'
    	 );
      t.deepEqual(
         parse([ '--host=localhost', '--port=555' ]),
         { host : 'localhost', port : 555, _ : [] },
         'long captures eq'
    	 );
      t.end();
   });
}

/*---------------------------------------------------------------------*/
/*    num.js ...                                                       */
/*---------------------------------------------------------------------*/
function num() {
   test('nums', function (t) {
      var argv = parse([
         '-x', '1234',
         '-y', '5.67',
         '-z', '1e7',
         '-w', '10f',
         '--hex', '0xdeadbeef',
         '789'
    	 ]);
      t.deepEqual(argv, {
         x : 1234,
         y : 5.67,
         z : 1e7,
         w : '10f',
         hex : 0xdeadbeef,
         _ : [ 789 ]
      });
      t.deepEqual(typeof argv.x, 'number');
      t.deepEqual(typeof argv.y, 'number');
      t.deepEqual(typeof argv.z, 'number');
      t.deepEqual(typeof argv.w, 'string');
      t.deepEqual(typeof argv.hex, 'number');
      t.deepEqual(typeof argv._[0], 'number');
      t.end();
   });

   test('already a number', function (t) {
      var argv = parse([ '-x', 1234, 789 ]);
      t.deepEqual(argv, { x : 1234, _ : [ 789 ] });
      t.deepEqual(typeof argv.x, 'number');
      t.deepEqual(typeof argv._[0], 'number');
      t.end();
   });
}

/*---------------------------------------------------------------------*/
/*    parse.js ...                                                     */
/*---------------------------------------------------------------------*/
function parseJS() {
   test('parse args', function (t) {
      t.deepEqual(
         parse([ '--no-moo' ]),
         { moo : false, _ : [] },
         'no'
    	 );
      t.deepEqual(
         parse([ '-v', 'a', '-v', 'b', '-v', 'c' ]),
         { v : ['a','b','c'], _ : [] },
         'multi'
    	 );
      t.end();
   });
   
   test('comprehensive', function (t) {
      t.deepEqual(
         parse([
            '--name=meowmers', 'bare', '-cats', 'woo',
            '-h', 'awesome', '--multi=quux',
            '--key', 'value',
            '-b', '--bool', '--no-meep', '--multi=baz',
            '--', '--not-a-flag', 'eek'
            ]),
         {
            c : true,
            a : true,
            t : true,
            s : 'woo',
            h : 'awesome',
            b : true,
            bool : true,
            key : 'value',
            multi : [ 'quux', 'baz' ],
            meep : false,
            name : 'meowmers',
            _ : [ 'bare', '--not-a-flag', 'eek' ]
         }
    	 );
      t.end();
   });

   test('flag boolean', function (t) {
      var argv = parse([ '-t', 'moo' ], { boolean: 't' });
      t.deepEqual(argv, { t : true, _ : [ 'moo' ] });
      t.deepEqual(typeof argv.t, 'boolean');
      t.end();
   });

   test('flag boolean value', function (t) {
      var argv = parse(['--verbose', 'false', 'moo', '-t', 'true'], {
         boolean: [ 't', 'verbose' ],
default: { verbose: true }
      });
      
      t.deepEqual(argv, {
         verbose: false,
         t: true,
         _: ['moo']
      });
      
      t.deepEqual(typeof argv.verbose, 'boolean');
      t.deepEqual(typeof argv.t, 'boolean');
      t.end();
   });

   test('newlines in params' , function (t) {
      var args = parse([ '-s', "X\nX" ])
    	 t.deepEqual(args, { _ : [], s : "X\nX" });
      
      // reproduce in bash:
      // VALUE="new
      // line"
      // node program.js --s="$VALUE"
      args = parse([ "--s=X\nX" ])
    	 t.deepEqual(args, { _ : [], s : "X\nX" });
      t.end();
   });

   test('strings' , function (t) {
      var s = parse([ '-s', '0001234' ], { string: 's' }).s;
      t.equal(s, '0001234');
      t.equal(typeof s, 'string');
      
      var x = parse([ '-x', '56' ], { string: 'x' }).x;
      t.equal(x, '56');
      t.equal(typeof x, 'string');
      t.end();
   });

   test('stringArgs', function (t) {
      var s = parse([ '  ', '  ' ], { string: '_' })._;
      t.same(s.length, 2);
      t.same(typeof s[0], 'string');
      t.same(s[0], '  ');
      t.same(typeof s[1], 'string');
      t.same(s[1], '  ');
      t.end();
   });

   test('empty strings', function(t) {
      var s = parse([ '-s' ], { string: 's' }).s;
      t.equal(s, '');
      t.equal(typeof s, 'string');

      var str = parse([ '--str' ], { string: 'str' }).str;
      t.equal(str, '');
      t.equal(typeof str, 'string');

      var letters = parse([ '-art' ], {
         string: [ 'a', 't' ]
      });

      t.equal(letters.a, '');
      t.equal(letters.r, true);
      t.equal(letters.t, '');

      t.end();
   });


   test('string and alias', function(t) {
      var x = parse([ '--str',  '000123' ], {
         string: 's',
         alias: { s: 'str' }
      });

      t.equal(x.str, '000123');
      t.equal(typeof x.str, 'string');
      t.equal(x.s, '000123');
      t.equal(typeof x.s, 'string');

      var y = parse([ '-s',  '000123' ], {
         string: 'str',
         alias: { str: 's' }
      });

      t.equal(y.str, '000123');
      t.equal(typeof y.str, 'string');
      t.equal(y.s, '000123');
      t.equal(typeof y.s, 'string');
      t.end();
   });

   test('slashBreak', function (t) {
      t.same(
         parse([ '-I/foo/bar/baz' ]),
         { I : '/foo/bar/baz', _ : [] }
    	 );
      t.same(
         parse([ '-xyz/foo/bar/baz' ]),
         { x : true, y : true, z : '/foo/bar/baz', _ : [] }
    	 );
      t.end();
   });

   test('alias', function (t) {
      var argv = parse([ '-f', '11', '--zoom', '55' ], {
         alias: { z: 'zoom' }
      });
      t.equal(argv.zoom, 55);
      t.equal(argv.z, argv.zoom);
      t.equal(argv.f, 11);
      t.end();
   });

   test('multiAlias', function (t) {
      var argv = parse([ '-f', '11', '--zoom', '55' ], {
         alias: { z: [ 'zm', 'zoom' ] }
      });
      t.equal(argv.zoom, 55);
      t.equal(argv.z, argv.zoom);
      t.equal(argv.z, argv.zm);
      t.equal(argv.f, 11);
      t.end();
   });

   test('nested dotted objects', function (t) {
      var argv = parse([
         '--foo.bar', '3', '--foo.baz', '4',
         '--foo.quux.quibble', '5', '--foo.quux.o_O',
         '--beep.boop'
    	 ]);
      
      t.same(argv.foo, {
         bar : 3,
         baz : 4,
         quux : {
            quibble : 5,
            o_O : true
         }
      });
      t.same(argv.beep, { boop : true });
      t.end();
   });
}

/*---------------------------------------------------------------------*/
/*    parse_modified.js ...                                            */
/*---------------------------------------------------------------------*/
function parse_modified() {
   test('parse with modifier functions' , function (t) {
      t.plan(1);
      
      var argv = parse([ '-b', '123' ], { boolean: 'b' });
      t.deepEqual(argv, { b: true, _: [123] });
   });
}

/*---------------------------------------------------------------------*/
/*    proto.js ...                                                     */
/*---------------------------------------------------------------------*/
function proto() {
   test('proto pollution', function (t) {
    var argv = parse(['--__proto__.x','123']);
    t.equal({}.x, undefined);
    t.equal(argv.__proto__.x, undefined);
    t.equal(argv.x, undefined);
    t.end();
});

test('proto pollution (array)', function (t) {
    var argv = parse(['--x','4','--x','5','--x.__proto__.z','789']);
    t.equal({}.z, undefined);
    t.deepEqual(argv.x, [4,5]);
    t.equal(argv.x.z, undefined);
    t.equal(argv.x.__proto__.z, undefined);
    t.end();
});

test('proto pollution (number)', function (t) {
    var argv = parse(['--x','5','--x.__proto__.z','100']);
    t.equal({}.z, undefined);
    t.equal((4).z, undefined);
    t.equal(argv.x, 5);
    t.equal(argv.x.z, undefined);
    t.end();
});

test('proto pollution (string)', function (t) {
    var argv = parse(['--x','abc','--x.__proto__.z','def']);
    t.equal({}.z, undefined);
    t.equal('...'.z, undefined);
    t.equal(argv.x, 'abc');
    t.equal(argv.x.z, undefined);
    t.end();
});

/* test('proto pollution (constructor)', function (t) {                */
/*     var argv = parse(['--constructor.prototype.y','123']);          */
/*     t.equal({}.y, undefined);                                       */
/*     t.equal(argv.y, undefined);                                     */
/*     t.end();                                                        */
/* });                                                                 */
}

/*---------------------------------------------------------------------*/
/*    short.js ...                                                     */
/*---------------------------------------------------------------------*/
function short() {
   test('numeric short args', function (t) {
      t.plan(2);
      t.deepEqual(parse([ '-n123' ]), { n: 123, _: [] });
      t.deepEqual(
         parse([ '-123', '456' ]),
         { 1: true, 2: true, 3: 456, _: [] }
    	 );
   });

   test('short', function (t) {
      t.deepEqual(
         parse([ '-b' ]),
         { b : true, _ : [] },
         'short boolean'
    	 );
      t.deepEqual(
         parse([ 'foo', 'bar', 'baz' ]),
         { _ : [ 'foo', 'bar', 'baz' ] },
         'bare'
    	 );
      t.deepEqual(
         parse([ '-cats' ]),
         { c : true, a : true, t : true, s : true, _ : [] },
         'group'
    	 );
      t.deepEqual(
         parse([ '-cats', 'meow' ]),
         { c : true, a : true, t : true, s : 'meow', _ : [] },
         'short group next'
    	 );
      t.deepEqual(
         parse([ '-h', 'localhost' ]),
         { h : 'localhost', _ : [] },
         'short capture'
    	 );
      t.deepEqual(
         parse([ '-h', 'localhost', '-p', '555' ]),
         { h : 'localhost', p : 555, _ : [] },
         'short captures'
    	 );
      t.end();
   });
   
   test('mixed short bool and capture', function (t) {
      t.same(
         parse([ '-h', 'localhost', '-fp', '555', 'script.js' ]),
         {
            f : true, p : 555, h : 'localhost',
            _ : [ 'script.js' ]
         }
    	 );
      t.end();
   });
   
   test('short and long', function (t) {
      t.deepEqual(
         parse([ '-h', 'localhost', '-fp', '555', 'script.js' ]),
         {
            f : true, p : 555, h : 'localhost',
            _ : [ 'script.js' ]
         }
    	 );
      t.end();
   });
}

/*---------------------------------------------------------------------*/
/*    stop_early.js ...                                                */
/*---------------------------------------------------------------------*/
function stop_early() {
   test('stops parsing on the first non-option when stopEarly is set', function (t) {
      var argv = parse(['--aaa', 'bbb', 'ccc', '--ddd'], {
         stopEarly: true
      });

      t.deepEqual(argv, {
         aaa: 'bbb',
         _: ['ccc', '--ddd']
      });

      t.end();
   });
}

/*---------------------------------------------------------------------*/
/*    unknown.js ...                                                   */
/*---------------------------------------------------------------------*/
function unknown() {
   test('boolean and alias is not unknown', function (t) {
      var unknown = [];
      function unknownFn(arg) {
         unknown.push(arg);
         return false;
      }
      var aliased = [ '-h', 'true', '--derp', 'true' ];
      var regular = [ '--herp',  'true', '-d', 'true' ];
      var opts = {
         alias: { h: 'herp' },
         boolean: 'h',
         unknown: unknownFn
      };
      var aliasedArgv = parse(aliased, opts);
      var propertyArgv = parse(regular, opts);

      t.same(unknown, ['--derp', '-d']);
      t.end();
   });

   test('flag boolean true any double hyphen argument is not unknown', function (t) {
      var unknown = [];
      function unknownFn(arg) {
         unknown.push(arg);
         return false;
      }
      var argv = parse(['--honk', '--tacos=good', 'cow', '-p', '55'], {
         boolean: true,
         unknown: unknownFn
      });
      t.same(unknown, ['--tacos=good', 'cow', '-p']);
      t.same(argv, {
         honk: true,
         _: []
      });
      t.end();
   });

   test('string and alias is not unknown', function (t) {
      var unknown = [];
      function unknownFn(arg) {
         unknown.push(arg);
         return false;
      }
      var aliased = [ '-h', 'hello', '--derp', 'goodbye' ];
      var regular = [ '--herp',  'hello', '-d', 'moon' ];
      var opts = {
         alias: { h: 'herp' },
         string: 'h',
         unknown: unknownFn
      };
      var aliasedArgv = parse(aliased, opts);
      var propertyArgv = parse(regular, opts);

      t.same(unknown, ['--derp', '-d']);
      t.end();
   });

   test('default and alias is not unknown', function (t) {
      var unknown = [];
      function unknownFn(arg) {
         unknown.push(arg);
         return false;
      }
      var aliased = [ '-h', 'hello' ];
      var regular = [ '--herp',  'hello' ];
      var opts = {
default: { 'h': 'bar' },
        alias: { 'h': 'herp' },
        unknown: unknownFn
    };
    var aliasedArgv = parse(aliased, opts);
    var propertyArgv = parse(regular, opts);

    t.same(unknown, []);
    t.end();
    unknownFn(); // exercise fn for 100% coverage
});

test('value following -- is not unknown', function (t) {
    var unknown = [];
    function unknownFn(arg) {
        unknown.push(arg);
        return false;
    }
    var aliased = [ '--bad', '--', 'good', 'arg' ];
    var opts = {
        '--': true,
        unknown: unknownFn
    };
    var argv = parse(aliased, opts);

    t.same(unknown, ['--bad']);
    t.same(argv, {
        '--': ['good', 'arg'],
        '_': []
    })
    t.end();
});
}

/*---------------------------------------------------------------------*/
/*    whitespace ...                                                   */
/*---------------------------------------------------------------------*/
function whitespace() {
   test('whitespace should be whitespace' , function (t) {
      t.plan(1);
      var x = parse([ '-x', '\t' ]).x;
      t.equal(x, '\t');
   });
}

/*---------------------------------------------------------------------*/
/*    testAll                                                          */
/*---------------------------------------------------------------------*/
function testAll( verb ) {
   verbOn = verb;
   allBool();
   bool();
   dash();
   defaultBool();
   dotted();
   kv_short();
   long();
   num();
   parseJS();
   parse_modified();
   proto();
   short();
   stop_early();
   unknown();
   whitespace();
}

function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   testAll( true );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      testAll( false );
   }
}

const K = 20;

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? K / 10
   : (process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000) * K;

main( "minimist", N ); 
