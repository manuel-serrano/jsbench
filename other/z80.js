/*!
 * A Javascript/Typescript Z80 Emulator
 * Copyright (C) 2015  Claudemiro Alves Feitosa Neto <dimiro1@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

function assertEqual( a, b ) {
   return a === b;
}

function consolelog( msg ) {
}

function Z80(memory, io) {
   var _this = this;
   this.OPCODE_T_STATES = [
      4, 10, 7, 6, 4, 4, 7, 4, 4, 11, 7, 6, 4, 4, 7, 4,
      0, 10, 7, 6, 4, 4, 7, 4, 12, 11, 7, 6, 4, 4, 7, 4,
      0, 10, 7, 6, 4, 4, 7, 4, 0, 11, 7, 6, 4, 4, 7, 4,
      0, 10, 7, 6, 4, 4, 7, 4, 0, 11, 7, 6, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      7, 7, 7, 7, 7, 7, 4, 7, 4, 4, 4, 4, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
      0, 10, 0, 0, 0, 11, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0,
      0, 10, 0, 11, 0, 11, 7, 0, 0, 4, 0, 11, 0, 4, 7, 0,
      0, 10, 0, 19, 0, 11, 7, 0, 0, 4, 0, 4, 0, 0, 7, 0,
      0, 10, 0, 4, 0, 11, 7, 0, 0, 0, 0, 0, 0, 4, 7, 0
      ];
   this.OPCODE_CB_STATES = [
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
      8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
      8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
      8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
      8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8
      ];
   this.INSTRUCTIONS = {
      0x00: function () { },
      0x01: function () {
	 _this.bc = _this.memory.readWord(_this.pc);
	 _this.inc2Pc();
      },
      0x02: function () {
	 _this.memory.writeByte(_this.bc, _this.a);
      },
      0x03: function () {
	 _this.inc16Bit("bc");
      },
      0x04: function () {
	 _this.inc8Bit("b");
      },
      0x05: function () {
	 _this.dec8Bit("b");
      },
      0x06: function () {
	 _this.b = _this.memory.readByte(_this.pc);
	 _this.incPc();
      },
      0x07: function () {
	 _this.rlc("a");
      },
      0x08: function () {
	 _this.exafaf();
      },
      0x09: function () {
	 _this.add16Bit("bc");
      },
      0x0A: function () {
	  _this.a = _this.memory.readByte(_this.bc);
       },
       0x0B: function () {
	   _this.dec16Bit("bc");
	},
	0x0C: function () {
	    _this.inc8Bit("c");
	 },
	 0x0D: function () {
	     _this.dec8Bit("c");
	  },
	  0x0E: function () {
	      _this.c = _this.memory.readByte(_this.pc);
	      _this.incPc();
	   },
	   0x0F: function () {
	       _this.rrc("a");
	    },
	    0x10: function () {
	       _this.dec8Bit("b");
	       var label = _this.memory.readByte(_this.pc);
	       if (_this.b !== 0) {
		  _this.pc = label;
	       }
	    },
   };
   this.memory = memory;
   this.io = io;
   this.tStates = 0;
   this.reset();
}

Object.defineProperty(Z80.prototype, "pc", {
    get: function () {
        return this._pc & 0xFFFF;
    },
    set: function (n) {
        this._pc = n & 0xFFFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "sp", {
    get: function () {
        return this._sp;
    },
    set: function (n) {
        this._sp = n & 0xFFFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "a", {
    get: function () {
        return this._a;
    },
    set: function (n) {
        this._a = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_a", {
    get: function () {
        return this._alt_a;
    },
    set: function (n) {
        this._alt_a = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "f", {
    get: function () {
        return ((this.flag_s << 7) |
            (this.flag_z << 6) |
            (this.flag_5 << 5) |
            (this.flag_h << 4) |
            (this.flag_3 << 3) |
            (this.flag_pv << 2) |
            (this.flag_n << 1) |
            (this.flag_c << 0));
    },
    set: function (n) {
        n &= 0xFF;
        this.flag_s = (n & 0x80) >> 7;
        this.flag_z = (n & 0x40) >> 6;
        this.flag_5 = (n & 0x20) >> 5;
        this.flag_h = (n & 0x10) >> 4;
        this.flag_3 = (n & 0x08) >> 3;
        this.flag_pv = (n & 0x04) >> 2;
        this.flag_n = (n & 0x02) >> 1;
        this.flag_c = (n & 0x01) >> 0;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_f", {
    get: function () {
        return this._alt_f;
    },
    set: function (n) {
        this._alt_f = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "af", {
    get: function () {
        return (this.a << 8) | (this.f & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.a = n >> 8;
        this.f = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_af", {
    get: function () {
        return (this.alt_a << 8) | (this.alt_f & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.alt_a = (n >> 8) & 0xFF;
        this.alt_f = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "h", {
    get: function () {
        return this._h;
    },
    set: function (n) {
        this._h = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_h", {
    get: function () {
        return this._alt_h;
    },
    set: function (n) {
        this._alt_h = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "l", {
    get: function () {
        return this._l;
    },
    set: function (n) {
        this._l = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_l", {
    get: function () {
        return this._alt_l;
    },
    set: function (n) {
        this._alt_l = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "hl", {
    get: function () {
        return (this.h << 8) | (this.l & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.h = (n >> 8) & 0xFF;
        this.l = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_hl", {
    get: function () {
        return (this.alt_h << 8) | (this.alt_l & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.alt_h = (n >> 8) & 0xFF;
        this.alt_l = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "b", {
    get: function () {
        return this._b;
    },
    set: function (n) {
        this._b = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_b", {
    get: function () {
        return this._alt_b;
    },
    set: function (n) {
        this._alt_b = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "c", {
    get: function () {
        return this._c;
    },
    set: function (n) {
        this._c = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_c", {
    get: function () {
        return this._alt_c;
    },
    set: function (n) {
        this._alt_c = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "bc", {
    get: function () {
        return (this.b << 8) | (this.c & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.b = (n >> 8) & 0xFF;
        this.c = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_bc", {
    get: function () {
        return (this.alt_b << 8) | (this.alt_c & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.alt_b = (n >> 8) & 0xFF;
        this.alt_c = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "d", {
    get: function () {
        return this._d;
    },
    set: function (n) {
        this._d = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_d", {
    get: function () {
        return this._alt_d;
    },
    set: function (n) {
        this._alt_d = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "e", {
    get: function () {
        return this._e;
    },
    set: function (n) {
        this._e = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_e", {
    get: function () {
        return this._alt_e;
    },
    set: function (n) {
        this._alt_e = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "de", {
    get: function () {
        return (this.d << 8) | (this.e & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.d = (n >> 8) & 0xFF;
        this.e = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "alt_de", {
    get: function () {
        return (this.alt_d << 8) | (this.alt_e & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.alt_d = (n >> 8) & 0xFF;
        this.alt_e = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "i", {
    get: function () {
        return this._i;
    },
    set: function (n) {
        this._i = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "r", {
    get: function () {
        return this._r;
    },
    set: function (n) {
        this._r = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "r7", {
    get: function () {
        return (this._r & 0x80) >> 7;
    },
    set: function (n) {
        this._r = (n << 7) | (this._r & 0x7F);
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "ir", {
    set: function (n) {
        n &= 0xFFFF;
        this.i = (n >> 8) & 0xFF;
        this.r = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "ixh", {
    get: function () {
        return this._ixh;
    },
    set: function (n) {
        this._ixh = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "ixl", {
    get: function () {
        return this._ixl;
    },
    set: function (n) {
        this._ixl = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "ix", {
    get: function () {
        return (this._ixh << 8) | (this._ixl & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.ixh = (n >> 8) & 0xFF;
        this.ixl = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "iyh", {
    get: function () {
        return this._iyh;
    },
    set: function (n) {
        this._iyh = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "iyl", {
    get: function () {
        return this._iyl;
    },
    set: function (n) {
        this._iyl = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Z80.prototype, "iy", {
    get: function () {
        return (this._iyh << 8) | (this._iyl & 0xFF);
    },
    set: function (n) {
        n &= 0xFFFF;
        this.iyh = (n >> 8) & 0xFF;
        this.iyl = n & 0xFF;
    },
    enumerable: true,
    configurable: true
});
Z80.prototype.pop = function () {
    var temp = this.memory.readWord(this.sp);
    this.sp += 2;
    return temp;
};
Z80.prototype.reset = function () {
    this.af = 0;
    this.bc = 0;
    this.de = 0;
    this.pc = 0;
    this.sp = 0;
    this.i = 0;
    this.r = 0;
    this.ix = 0;
    this.iy = 0;
    this.alt_af = 0;
    this.alt_bc = 0;
    this.alt_de = 0;
    this.alt_hl = 0;
    this.iff1 = 0;
    this.iff2 = 0;
    this.im = 0;
    this.isHalted = 0;
    this.memory.data.fill(0);
};
Z80.prototype.inc8Bit = function (reg) {
    this[reg]++;
    this.flag_s = (this[reg] > 0) ? 1 : 0;
    this.flag_z = (this[reg] === 0) ? 1 : 0;
    this.flag_h = ((this[reg] & 0x0F) === 0) ? 1 : 0;
    this.flag_pv = (this[reg] === 0x80) ? 1 : 0;
    this.flag_n = 0;
};
Z80.prototype.dec8Bit = function (reg) {
    this.flag_pv = (this[reg] === 0x80) ? 1 : 0;
    this[reg] -= 1;
    this.flag_s = (this[reg] === 0xFF) ? 1 : 0;
    this.flag_z = (this[reg] === 0) ? 1 : 0;
    this.flag_h = ((this[reg] & 0x0F) === 0x0F) ? 1 : 0;
    this.flag_5 = this.getBit(this[reg], 5);
    this.flag_3 = this.getBit(this[reg], 3);
    this.flag_n = 1;
};
Z80.prototype.inc16Bit = function (reg) {
    this[reg]++;
};
Z80.prototype.dec16Bit = function (reg) {
    this[reg]--;
};
Z80.prototype.add16Bit = function (reg) {
    this.flag_h = ((this.hl & 0xFFF) + (this[reg] & 0xFFF) > 0xFFF) ? 1 : 0;
    this.flag_c = (this.hl + this[reg] > 0xFFFF) ? 1 : 0;
    this.flag_5 = this.getBit(this[reg], 5);
    this.flag_n = 0;
    this.hl += this[reg];
};
Z80.prototype.getBit = function (x, bit) {
    return (x & (1 << bit - 1)) > 0 ? 1 : 0;
};
Z80.prototype.rlc = function (reg) {
    this.flag_c = this.getBit(this[reg], 8);
    this[reg] = ((this[reg] << 1) & 0xFF) | this.flag_c;
    this.flag_n = 0;
    this.flag_h = 0;
};
Z80.prototype.rrc = function (reg) {
    this.flag_c = this.getBit(this[reg], 1);
    this[reg] = (this[reg] >> 1) | (this.flag_c << 7);
    this.flag_5 = 1;
    this.flag_h = 0;
    this.flag_n = 0;
};
Z80.prototype.incPc = function () {
    this.pc++;
};
Z80.prototype.inc2Pc = function () {
    this.pc += 2;
};
Z80.prototype.exafaf = function () {
    var temp = this.af;
    this.af = this.alt_af;
    this.alt_af = temp;
};
Z80.prototype.decodeInstruction = function (opcode) {
    this.tStates += this.OPCODE_T_STATES[opcode];
    return this.INSTRUCTIONS[opcode];
};
Z80.prototype.halted = function () {
    return this.isHalted === 1;
};
Z80.prototype.executeInstruction = function () {
    var opcode = this.memory.readByte(this.pc);
    this.r = (this.r + 1) & 0x7F;
    this.incPc();
    this.decodeInstruction(opcode)();
};
Z80.prototype.TStates = function () {
    return this.tStates;
};
Z80.prototype.resetTStates = function () {
    this.tStates = 0;
};

var testSuite = {
    "00": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x00]
        },
        "output": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "01": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x01, 0x12, 0x34]
        },
        "output": {
            "regs": [0x0000, 0x3412, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0003, 0x00, 0x01, 0, 0, 0, 0, 10],
            "mem": []
        }
    },

    "02": {
        "input": {
            "regs": [0x5600, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x02]
        },
        "output": {
            "regs": [0x5600, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 7],
            "mem": [0x0001, 0x56]
        }
    },

    "03": {
        "input": {
            "regs": [0x0000, 0x789a, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x03]
        },
        "output": {
            "regs": [0x0000, 0x789b, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 6],
            "mem": []
        }
    },

    "04": {
        "input": {
            "regs": [0x0000, 0xff00, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x04]
        },
        "output": {
            "regs": [0x0050, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "05": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x05]
        },
        "output": {
            "regs": [0x00ba, 0xff00, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "06": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x06, 0xbc]
        },
        "output": {
            "regs": [0x0000, 0xbc00, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0002, 0x00, 0x01, 0, 0, 0, 0, 7],
            "mem": []
        }
    },

    "07": {
        "input": {
            "regs": [0x8800, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x07]
        },
        "output": {
            "regs": [0x1101, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "08": {
        "input": {
            "regs": [0xdef0, 0x0000, 0x0000, 0x0000, 0x1234, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x08]
        },
        "output": {
            "regs": [0x1234, 0x0000, 0x0000, 0x0000, 0xdef0, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "09": {
        "input": {
            "regs": [0x0000, 0x5678, 0x0000, 0x9abc, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x09]
        },
        "output": {
            "regs": [0x0030, 0x5678, 0x0000, 0xf134, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 11],
            "mem": []
        }
    },

    "0a": {
        "input": {
            "regs": [0x0000, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x0a, 0xde]
        },
        "output": {
            "regs": [0xde00, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 7],
            "mem": []
        }
    },

    "0b": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x0b]
        },
        "output": {
            "regs": [0x0000, 0xffff, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 6],
            "mem": []
        }
    },

    "0c": {
        "input": {
            "regs": [0x0000, 0x007f, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x0c]
        },
        "output": {
            "regs": [0x0094, 0x0080, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "0d": {
        "input": {
            "regs": [0x0000, 0x0080, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x0d]
        },
        "output": {
            "regs": [0x003e, 0x007f, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "0e": {
        "input": {
            "regs": [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x0e, 0xf0]
        },
        "output": {
            "regs": [0x0000, 0x00f0, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0002, 0x00, 0x01, 0, 0, 0, 0, 7],
            "mem": []
        }
    },

    "0f": {
        "input": {
            "regs": [0x4100, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x0f]
        },
        "output": {
            "regs": [0xa021, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0001, 0x00, 0x01, 0, 0, 0, 0, 4],
            "mem": []
        }
    },

    "10": {
        "input": {
            "regs": [0x0000, 0x0800, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x00, 0x00, 0, 0, 0, 0],
            "mem": [0x0000, 0x00, 0x10, 0xfd, 0x0c]
        },
        "output": {
            "regs": [0x0000, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0004, 0x00, 0x11, 0, 0, 0, 0, 135],
            "mem": []
        }
    }
};

function suite( key ) {
   return testSuite[ key ];
}

function Memory() {
    this.data = new Array(0xFFFF);
}

Memory.prototype.readByte = function(address) {
    return this.data[address];
}

Memory.prototype.readWord = function(address) {
    return ((this.readByte(address + 1) << 8) | this.readByte(address));
}

Memory.prototype.writeByte = function(address, data) {
    this.data[address] = data & 0xFF;
}

Memory.prototype.writeWord = function(address, data) {
    this.writeByte(address, data);
    this.writeByte(address + 1, data >> 8);
}

// --------------- IO -------------------
function IO() {}

IO.prototype.read = function(address) {
    return 0;
}

IO.prototype.write = function(address, data) {
    consolelog(data);
}

// -----------  Util functions-------------

var NAMES_TABLE = {
    0: "af",
    1: "bc",
    2: "de",
    3: "hl",
    4: "alt_af",
    5: "alt_bc",
    6: "alt_de",
    7: "alt_hl",
    8: "ix",
    9: "iy",
    10: "sp",
    11: "pc",

    12: "i",
    13: "r",

    14: "iff1",
    15: "iff2",

    16: "im",
    17: "isHalted",
    18: "tStates"
};

function populateRegisters(z80, input) {
    input.regs.forEach((value, i) => {
        z80[NAMES_TABLE[i]] = value;
    });
}

function populateMemory(z80, input) {
    if (input.mem.length === 0) {
        return;
    }

    var address = input.mem[0];

    for (var i = 1; i < input.mem.length; i++) {
        z80.memory.data[address++] = input.mem[i];
    }
}

function testRegisters(z80, output) {
    output.regs.forEach((value, i) => {
        describe(NAMES_TABLE[i], () => {
            if (NAMES_TABLE[i] === "af") {
                consolelog(`${z80.flag_s}${z80.flag_z}${z80.flag_5}${z80.flag_h} ${z80.flag_3}${z80.flag_pv}${z80.flag_n}${z80.flag_c}`);
            }
            assertEqual(z80[NAMES_TABLE[i]], value);
        });
    });
}

function testMemory(z80, output, opcode) {
    if (output.mem.length === 0) {
        return;
    }

    var address = output.mem[0];

    output.mem.forEach((value, i) => {
        if (i !== 0) { // Discard the first Element
            describe(`Memory: 0x${opcode}`, () => {
                assertEqual(z80.memory.data[address++], value);
            });
        }
    });
}

// ----------- Instructions --------------


var tests = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f",
             /*"10"*/];


function describe( lbl, thunk ) {
   //console.log( lbl, "..." );
   return thunk();
}

function main( bench, N ) {
   console.log( bench + "(", N, ")..." );
   const mem = new Memory();
   
   for( let i = 0; i < 10; i++ ) {
      console.log( i );
      for( let j = 0; j < N; j++ ) {
   	 tests.forEach((opcode) => {
      	       describe(`0x${opcode}`, () => {
	    	  var test = suite(opcode);
	    	  var input = test.input;
	    	  var output = test.output;

	    	  // New CPU
	    	  var z80 = new Z80(mem, new IO());

	    	  // Registers
	    	  populateRegisters(z80, input);

	    	  // Memory
	    	  populateMemory(z80, input);

	    	  // Executing an Instruction
	    	  z80.executeInstruction();

	    	  // Testing
	    	  testRegisters(z80, output);

	    	  // Memory
	    	  testMemory(z80, output, opcode);
      	       });
      	    });
      }
   }
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 100
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 1000;

main( "z80", N ); 
