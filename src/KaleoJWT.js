var jwt = (function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	/**
	 * jshashes - https://github.com/h2non/jshashes
	 * Released under the "New BSD" license
	 *
	 * KALEO MODIFICATIONS
	 * Stripped out everything we dont need, only includes SHA256 algo
	 * Useage: var Hashes = require("hashes-hs256.js")
	 */

	var hashesHs256 = (function() {
	  var Hashes;

	  function utf8Encode(str) {
	    var x, y, output = '',
	      i = -1,
	      l;

	    if (str && str.length) {
	      l = str.length;
	      while ((i += 1) < l) {
	        /* Decode utf-16 surrogate pairs */
	        x = str.charCodeAt(i);
	        y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
	        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
	          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
	          i += 1;
	        }
	        /* Encode output as utf-8 */
	        if (x <= 0x7F) {
	          output += String.fromCharCode(x);
	        } else if (x <= 0x7FF) {
	          output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
	            0x80 | (x & 0x3F));
	        } else if (x <= 0xFFFF) {
	          output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
	            0x80 | ((x >>> 6) & 0x3F),
	            0x80 | (x & 0x3F));
	        } else if (x <= 0x1FFFFF) {
	          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
	            0x80 | ((x >>> 12) & 0x3F),
	            0x80 | ((x >>> 6) & 0x3F),
	            0x80 | (x & 0x3F));
	        }
	      }
	    }
	    return output;
	  }

	  /**
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   */

	  function safe_add(x, y) {
	    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	    return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /**
	   * Convert a raw string to a hex string
	   */

	  function rstr2hex(input, hexcase) {
	    var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef',
	      output = '',
	      x, i = 0,
	      l = input.length;
	    for (; i < l; i += 1) {
	      x = input.charCodeAt(i);
	      output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
	    }
	    return output;
	  }

	  /**
	   * Convert an array of big-endian words to a string
	   */

	  function binb2rstr(input) {
	    var i, l = input.length * 32,
	      output = '';
	    for (i = 0; i < l; i += 8) {
	      output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
	    }
	    return output;
	  }

	  /**
	   * Convert a raw string to an array of big-endian words
	   * Characters >255 have their high-byte silently ignored.
	   */

	  function rstr2binb(input) {
	    var i, l = input.length * 8,
	      output = Array(input.length >> 2),
	      lo = output.length;
	    for (i = 0; i < lo; i += 1) {
	      output[i] = 0;
	    }
	    for (i = 0; i < l; i += 8) {
	      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
	    }
	    return output;
	  }

	  /**
	   * Convert a raw string to an arbitrary string encoding
	   */

	  function rstr2any(input, encoding) {
	    var divisor = encoding.length,
	      remainders = Array(),
	      i, q, x, ld, quotient, dividend, output, full_length;

	    /* Convert to an array of 16-bit big-endian values, forming the dividend */
	    dividend = Array(Math.ceil(input.length / 2));
	    ld = dividend.length;
	    for (i = 0; i < ld; i += 1) {
	      dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
	    }

	    /**
	     * Repeatedly perform a long division. The binary array forms the dividend,
	     * the length of the encoding is the divisor. Once computed, the quotient
	     * forms the dividend for the next step. We stop when the dividend is zerHashes.
	     * All remainders are stored for later use.
	     */
	    while (dividend.length > 0) {
	      quotient = Array();
	      x = 0;
	      for (i = 0; i < dividend.length; i += 1) {
	        x = (x << 16) + dividend[i];
	        q = Math.floor(x / divisor);
	        x -= q * divisor;
	        if (quotient.length > 0 || q > 0) {
	          quotient[quotient.length] = q;
	        }
	      }
	      remainders[remainders.length] = x;
	      dividend = quotient;
	    }

	    /* Convert the remainders to the output string */
	    output = '';
	    for (i = remainders.length - 1; i >= 0; i--) {
	      output += encoding.charAt(remainders[i]);
	    }

	    /* Append leading zero equivalents */
	    full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
	    for (i = output.length; i < full_length; i += 1) {
	      output = encoding[0] + output;
	    }
	    return output;
	  }

	  /**
	   * Convert a raw string to a base-64 string
	   */

	  function rstr2b64(input, b64pad) {
	    var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	      output = '',
	      len = input.length,
	      i, j, triplet;
	    b64pad = b64pad || '=';
	    for (i = 0; i < len; i += 3) {
	      triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
	      for (j = 0; j < 4; j += 1) {
	        if (i * 8 + j * 6 > input.length * 8) {
	          output += b64pad;
	        } else {
	          output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
	        }
	      }
	    }
	    return output;
	  }

	  Hashes = {
	    /**
	     * @property {String} version
	     * @readonly
	     */
	    VERSION: '1.0.5',
	    /**
	     * @class Hashes.SHA256
	     * @param {config}
	     *
	     * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2
	     * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
	     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	     * See http://pajhome.org.uk/crypt/md5 for details.
	     * Also http://anmar.eu.org/projects/jssha2/
	     */
	    SHA256: function(options) {
	      /**
	       * Private properties configuration variables. You may need to tweak these to be compatible with
	       * the server-side, but the defaults work in most cases.
	       * @see this.setUpperCase() method
	       * @see this.setPad() method
	       */
	      (options && typeof options.uppercase === 'boolean') ? options.uppercase : false; // hexadecimal output case format. false - lowercase; true - uppercase  */
	        var b64pad = (options && typeof options.pad === 'string') ? options.pda : '=',
	        /* base-64 pad character. Default '=' for strict RFC compliance   */
	        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
	        /* enable/disable utf8 encoding */
	        sha256_K;

	      /* privileged (public) methods */
	      this.hex = function(s) {
	        return rstr2hex(rstr(s, utf8));
	      };
	      this.b64 = function(s) {
	        return rstr2b64(rstr(s, utf8), b64pad);
	      };
	      this.any = function(s, e) {
	        return rstr2any(rstr(s, utf8), e);
	      };
	      this.raw = function(s) {
	        return rstr(s, utf8);
	      };
	      this.hex_hmac = function(k, d) {
	        return rstr2hex(rstr_hmac(k, d));
	      };
	      this.b64_hmac = function(k, d) {
	        return rstr2b64(rstr_hmac(k, d), b64pad);
	      };
	      this.any_hmac = function(k, d, e) {
	        return rstr2any(rstr_hmac(k, d), e);
	      };
	      /**
	       * Perform a simple self-test to see if the VM is working
	       * @return {String} Hexadecimal hash sample
	       * @public
	       */
	      this.vm_test = function() {
	        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
	      };
	      /**
	       * Enable/disable uppercase hexadecimal returned string
	       * @param {boolean}
	       * @return {Object} this
	       * @public
	       */
	      this.setUpperCase = function(a) {
	        return this;
	      };
	      /**
	       * @description Defines a base64 pad string
	       * @param {string} Pad
	       * @return {Object} this
	       * @public
	       */
	      this.setPad = function(a) {
	        b64pad = a || b64pad;
	        return this;
	      };
	      /**
	       * Defines a base64 pad string
	       * @param {boolean}
	       * @return {Object} this
	       * @public
	       */
	      this.setUTF8 = function(a) {
	        if (typeof a === 'boolean') {
	          utf8 = a;
	        }
	        return this;
	      };

	      // private methods

	      /**
	       * Calculate the SHA-512 of a raw string
	       */

	      function rstr(s, utf8) {
	        s = (utf8) ? utf8Encode(s) : s;
	        return binb2rstr(binb(rstr2binb(s), s.length * 8));
	      }

	      /**
	       * Calculate the HMAC-sha256 of a key and some data (raw strings)
	       */

	      function rstr_hmac(key, data) {
	        key = (utf8) ? utf8Encode(key) : key;
	        data = (utf8) ? utf8Encode(data) : data;
	        var hash, i = 0,
	          bkey = rstr2binb(key),
	          ipad = Array(16),
	          opad = Array(16);

	        if (bkey.length > 16) {
	          bkey = binb(bkey, key.length * 8);
	        }

	        for (; i < 16; i += 1) {
	          ipad[i] = bkey[i] ^ 0x36363636;
	          opad[i] = bkey[i] ^ 0x5C5C5C5C;
	        }

	        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
	        return binb2rstr(binb(opad.concat(hash), 512 + 256));
	      }

	      /*
	       * Main sha256 function, with its support functions
	       */

	      function sha256_S(X, n) {
	        return (X >>> n) | (X << (32 - n));
	      }

	      function sha256_R(X, n) {
	        return (X >>> n);
	      }

	      function sha256_Ch(x, y, z) {
	        return ((x & y) ^ ((~x) & z));
	      }

	      function sha256_Maj(x, y, z) {
	        return ((x & y) ^ (x & z) ^ (y & z));
	      }

	      function sha256_Sigma0256(x) {
	        return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));
	      }

	      function sha256_Sigma1256(x) {
	        return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));
	      }

	      function sha256_Gamma0256(x) {
	        return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));
	      }

	      function sha256_Gamma1256(x) {
	        return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));
	      }

	      sha256_K = [
	        1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
	        1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
	        264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
	        113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
	        1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
	        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
	        1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
	      ];

	      function binb(m, l) {
	        var HASH = [1779033703, -1150833019, 1013904242, -1521486534,
	          1359893119, -1694144372, 528734635, 1541459225
	        ];
	        var W = new Array(64);
	        var a, b, c, d, e, f, g, h;
	        var i, j, T1, T2;

	        /* append padding */
	        m[l >> 5] |= 0x80 << (24 - l % 32);
	        m[((l + 64 >> 9) << 4) + 15] = l;

	        for (i = 0; i < m.length; i += 16) {
	          a = HASH[0];
	          b = HASH[1];
	          c = HASH[2];
	          d = HASH[3];
	          e = HASH[4];
	          f = HASH[5];
	          g = HASH[6];
	          h = HASH[7];

	          for (j = 0; j < 64; j += 1) {
	            if (j < 16) {
	              W[j] = m[j + i];
	            } else {
	              W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
	                sha256_Gamma0256(W[j - 15])), W[j - 16]);
	            }

	            T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
	              sha256_K[j]), W[j]);
	            T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
	            h = g;
	            g = f;
	            f = e;
	            e = safe_add(d, T1);
	            d = c;
	            c = b;
	            b = a;
	            a = safe_add(T1, T2);
	          }

	          HASH[0] = safe_add(a, HASH[0]);
	          HASH[1] = safe_add(b, HASH[1]);
	          HASH[2] = safe_add(c, HASH[2]);
	          HASH[3] = safe_add(d, HASH[3]);
	          HASH[4] = safe_add(e, HASH[4]);
	          HASH[5] = safe_add(f, HASH[5]);
	          HASH[6] = safe_add(g, HASH[6]);
	          HASH[7] = safe_add(h, HASH[7]);
	        }
	        return HASH;
	      }

	    }
	  };

	  return Hashes;
	}()); // IIFE

	var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=this._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64;}else if(isNaN(i)){a=64;}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a);}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r);}if(a!=64){t=t+String.fromCharCode(i);}}t=this._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128);}else {t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128);}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++;}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2;}else {c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3;}}return t}};

	var Base64url={encode:function(s){s=s.replace(/=+$/,'');s=s.replace(/\+/g,'-');s=s.replace(/\//g,'_');return s;},decode:function(s){s=(s+'===').slice(0,s.length+(s.length % 4));s.replace(/-/g,'+').replace(/_/g,'/');return s;}};

	// KaleoJWT
	var src = (function(){

	  /*! jshashes - New BSD License - https://github.com/h2non/jshashes */
	  var Hashes = hashesHs256;
	  var SHA256 = new Hashes.SHA256();
	  var Base64$1 = Base64;
	  var Base64url$1 = Base64url;

	  var HEADER = {alg: "HS256", typ: "JWT"};

	  function parseToken(token) {
	    if (token.match(/^([^.]+)\.([^.]+)\.([^.]+)$/) == null) {
	      throw "JWT token is not a form of 'Head.Payload.SigValue'.";
	    }
	    return {
	      header: RegExp.$1,
	      payload: RegExp.$2,
	      sig: RegExp.$3
	    }
	  }

	  function generateSignedToken(header, payload, secret) {
	    var encodedHeader  = Base64url$1.encode(Base64$1.encode(JSON.stringify(header)));
	    var encodedPayload = Base64url$1.encode(Base64$1.encode(JSON.stringify(payload)));
	    var sig = Base64url$1.encode(SHA256.b64_hmac(secret, encodedHeader+"."+encodedPayload));
	    return encodedHeader+"."+encodedPayload+"."+sig;
	  }

	  function verifySignedToken(token, secret) {
	    var parts = parseToken(token);
	    var sig = Base64url$1.encode(SHA256.b64_hmac(secret, parts.header+"."+parts.payload));
	    return sig === parts.sig;
	  }

	  // Public API
	  return {
	    sign: function(data, secret) {
	      // Default to expire in one hour
	      data.exp = data.exp || (Math.floor(Date.now() / 1000)+3600);
	      return generateSignedToken(HEADER, data, secret);
	    },
	    decode: function(token) {
	      var obj = parseToken(token);
	      return Base64$1.decode(Base64url$1.decode(obj.payload));
	    },
	    verify: function(token, secret) {
	      return verifySignedToken(token, secret);
	    }
	  }
	})();

	var index = /*@__PURE__*/getDefaultExportFromCjs(src);

	return index;

})();
