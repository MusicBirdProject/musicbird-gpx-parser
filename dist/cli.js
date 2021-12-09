'use strict';

var fs = require('fs');
var path = require('path');
var require$$0 = require('string_decoder');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

var cli = require('caporal');

const jBinary = require('jbinary');
const commonTypes = {
    'jBinary.littleEndian': true
};
function loadBinary(file) {
    return jBinary.load(file, commonTypes)
        .then(binary => binary.read('blob'));
}
function saveToFile(fileName, rawData, isJson = false) {
    const data = !isJson
        ? rawData
        : JSON.stringify(rawData, null, ' ');
    fs__default["default"].writeFileSync(fileName, data);
}
function loadFile(fileName, isJson = false) {
    const data = fs__default["default"].readFileSync(fileName).toString();
    return isJson
        ? JSON.parse(data)
        : data;
}
function logError(sourceFile, logFile, error = {}) {
    let content = `${sourceFile}:\n`;
    content += JSON.stringify(error, null, ' ') + '\n\n';
    fs__default["default"].appendFileSync(logFile, content);
}
function logCheckResult(success, sourceFile, logFile, data = {}) {
    const resSym = success ? '+' : '-';
    const line = `${resSym} ${sourceFile}`;
    console.log(line);
    if (!logFile) {
        return;
    }
    fs__default["default"].appendFileSync(logFile, `${line}\n`);
}
function walkSync(dir, filelist = []) {
    fs__default["default"].readdirSync(dir).forEach(file => {
        filelist = fs__default["default"].statSync(path__default["default"].join(dir, file)).isDirectory()
            ? walkSync(path__default["default"].join(dir, file), filelist)
            : filelist.concat(path__default["default"].join(dir, file));
    });
    return filelist;
}

var main = {};

var sax$1 = {};

(function (exports) {
(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
  sax.SAXParser = SAXParser;
  sax.SAXStream = SAXStream;
  sax.createStream = createStream;

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024;

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ];

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ];

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this;
    clearBuffers(parser);
    parser.q = parser.c = '';
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
    parser.opt = opt || {};
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
    parser.tags = [];
    parser.closed = parser.closedRoot = parser.sawRoot = false;
    parser.tag = parser.error = null;
    parser.strict = !!strict;
    parser.noscript = !!(strict || parser.opt.noscript);
    parser.state = S.BEGIN;
    parser.strictEntities = parser.opt.strictEntities;
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
    parser.attribList = [];

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS);
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false;
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0;
    }
    emit(parser, 'onready');
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o;
      var newf = new F();
      return newf
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [];
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
      return a
    };
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
    var maxActual = 0;
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length;
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser);
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata);
            parser.cdata = '';
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script);
            parser.script = '';
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i]);
        }
      }
      maxActual = Math.max(maxActual, len);
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual;
    parser.bufferCheckPosition = m + parser.position;
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = '';
    }
  }

  function flushBuffers (parser) {
    closeText(parser);
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata);
      parser.cdata = '';
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script);
      parser.script = '';
    }
  }

  SAXParser.prototype = {
    end: function () { end(this); },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this); }
  };

  var Stream;
  try {
    Stream = require('stream').Stream;
  } catch (ex) {
    Stream = function () {};
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  });

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this);

    this._parser = new SAXParser(strict, opt);
    this.writable = true;
    this.readable = true;

    var me = this;

    this._parser.onend = function () {
      me.emit('end');
    };

    this._parser.onerror = function (er) {
      me.emit('error', er);

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null;
    };

    this._decoder = null;

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev);
            me._parser['on' + ev] = h;
            return h
          }
          me.on(ev, h);
        },
        enumerable: true,
        configurable: false
      });
    });
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  });

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require$$0__default["default"].StringDecoder;
        this._decoder = new SD('utf8');
      }
      data = this._decoder.write(data);
    }

    this._parser.write(data.toString());
    this.emit('data', data);
    return true
  };

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk);
    }
    this._parser.end();
    return true
  };

  SAXStream.prototype.on = function (ev, handler) {
    var me = this;
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        args.splice(0, 0, ev);
        me.emit.apply(me, args);
      };
    }

    return Stream.prototype.on.call(me, ev, handler)
  };

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA[';
  var DOCTYPE = 'DOCTYPE';
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0;
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  };

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  };

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  };

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key];
    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
    sax.ENTITIES[key] = s;
  });

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s;
  }

  // shorthand
  S = sax.STATE;

  function emit (parser, event, data) {
    parser[event] && parser[event](data);
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser);
    emit(parser, nodeType, data);
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode) emit(parser, 'ontext', parser.textNode);
    parser.textNode = '';
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim();
    if (opt.normalize) text = text.replace(/\s+/g, ' ');
    return text
  }

  function error (parser, er) {
    closeText(parser);
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c;
    }
    er = new Error(er);
    parser.error = er;
    emit(parser, 'onerror', er);
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end');
    }
    closeText(parser);
    parser.c = '';
    parser.closed = true;
    emit(parser, 'onend');
    SAXParser.call(parser, parser.strict, parser.opt);
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message);
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
    var parent = parser.tags[parser.tags.length - 1] || parser;
    var tag = parser.tag = { name: parser.tagName, attributes: {} };

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns;
    }
    parser.attribList.length = 0;
    emitNode(parser, 'onopentagstart', tag);
  }

  function qname (name, attribute) {
    var i = name.indexOf(':');
    var qualName = i < 0 ? [ '', name ] : name.split(':');
    var prefix = qualName[0];
    var local = qualName[1];

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns';
      local = '';
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]();
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = '';
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true);
      var prefix = qn.prefix;
      var local = qn.local;

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue);
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue);
        } else {
          var tag = parser.tag;
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns);
          }
          tag.ns[local] = parser.attribValue;
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue]);
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue;
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      });
    }

    parser.attribName = parser.attribValue = '';
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag;

      // add namespace info to tag
      var qn = qname(parser.tagName);
      tag.prefix = qn.prefix;
      tag.local = qn.local;
      tag.uri = tag.ns[qn.prefix] || '';

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName));
        tag.uri = qn.prefix;
      }

      var parent = parser.tags[parser.tags.length - 1] || parser;
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          });
        });
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i];
        var name = nv[0];
        var value = nv[1];
        var qualName = qname(name, true);
        var prefix = qualName.prefix;
        var local = qualName.local;
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '');
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        };

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix));
          a.uri = prefix;
        }
        parser.tag.attributes[name] = a;
        emitNode(parser, 'onattribute', a);
      }
      parser.attribList.length = 0;
    }

    parser.tag.isSelfClosing = !!selfClosing;

    // process the tag
    parser.sawRoot = true;
    parser.tags.push(parser.tag);
    emitNode(parser, 'onopentag', parser.tag);
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT;
      } else {
        parser.state = S.TEXT;
      }
      parser.tag = null;
      parser.tagName = '';
    }
    parser.attribName = parser.attribValue = '';
    parser.attribList.length = 0;
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.');
      parser.textNode += '</>';
      parser.state = S.TEXT;
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>';
        parser.tagName = '';
        parser.state = S.SCRIPT;
        return
      }
      emitNode(parser, 'onscript', parser.script);
      parser.script = '';
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length;
    var tagName = parser.tagName;
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]();
    }
    var closeTo = tagName;
    while (t--) {
      var close = parser.tags[t];
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag');
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
      parser.textNode += '</' + parser.tagName + '>';
      parser.state = S.TEXT;
      return
    }
    parser.tagName = tagName;
    var s = parser.tags.length;
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop();
      parser.tagName = parser.tag.name;
      emitNode(parser, 'onclosetag', parser.tagName);

      var x = {};
      for (var i in tag.ns) {
        x[i] = tag.ns[i];
      }

      var parent = parser.tags[parser.tags.length - 1] || parser;
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p];
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n });
        });
      }
    }
    if (t === 0) parser.closedRoot = true;
    parser.tagName = parser.attribValue = parser.attribName = '';
    parser.attribList.length = 0;
    parser.state = S.TEXT;
  }

  function parseEntity (parser) {
    var entity = parser.entity;
    var entityLC = entity.toLowerCase();
    var num;
    var numStr = '';

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC;
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2);
        num = parseInt(entity, 16);
        numStr = num.toString(16);
      } else {
        entity = entity.slice(1);
        num = parseInt(entity, 10);
        numStr = num.toString(10);
      }
    }
    entity = entity.replace(/^0+/, '');
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity');
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA;
      parser.startTagPosition = parser.position;
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.');
      parser.textNode = c;
      parser.state = S.TEXT;
    }
  }

  function charAt (chunk, i) {
    var result = '';
    if (i < chunk.length) {
      result = chunk.charAt(i);
    }
    return result
  }

  function write (chunk) {
    var parser = this;
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString();
    }
    var i = 0;
    var c = '';
    while (true) {
      c = charAt(chunk, i++);
      parser.c = c;

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++;
        if (c === '\n') {
          parser.line++;
          parser.column = 0;
        } else {
          parser.column++;
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE;
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c);
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c);
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1;
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++);
              if (c && parser.trackPosition) {
                parser.position++;
                if (c === '\n') {
                  parser.line++;
                  parser.column = 0;
                } else {
                  parser.column++;
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1);
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA;
            parser.startTagPosition = parser.position;
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.');
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY;
            } else {
              parser.textNode += c;
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING;
          } else {
            parser.script += c;
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG;
          } else {
            parser.script += '<' + c;
            parser.state = S.SCRIPT;
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL;
            parser.sgmlDecl = '';
          } else if (isWhitespace(c)) ; else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG;
            parser.tagName = c;
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG;
            parser.tagName = '';
          } else if (c === '?') {
            parser.state = S.PROC_INST;
            parser.procInstName = parser.procInstBody = '';
          } else {
            strictFail(parser, 'Unencoded <');
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition;
              c = new Array(pad).join(' ') + c;
            }
            parser.textNode += '<' + c;
            parser.state = S.TEXT;
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata');
            parser.state = S.CDATA;
            parser.sgmlDecl = '';
            parser.cdata = '';
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT;
            parser.comment = '';
            parser.sgmlDecl = '';
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE;
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration');
            }
            parser.doctype = '';
            parser.sgmlDecl = '';
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
            parser.sgmlDecl = '';
            parser.state = S.TEXT;
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED;
            parser.sgmlDecl += c;
          } else {
            parser.sgmlDecl += c;
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL;
            parser.q = '';
          }
          parser.sgmlDecl += c;
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT;
            emitNode(parser, 'ondoctype', parser.doctype);
            parser.doctype = true; // just remember that we saw it.
          } else {
            parser.doctype += c;
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD;
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED;
              parser.q = c;
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c;
          if (c === parser.q) {
            parser.q = '';
            parser.state = S.DOCTYPE;
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c;
          if (c === ']') {
            parser.state = S.DOCTYPE;
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED;
            parser.q = c;
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c;
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD;
            parser.q = '';
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING;
          } else {
            parser.comment += c;
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED;
            parser.comment = textopts(parser.opt, parser.comment);
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment);
            }
            parser.comment = '';
          } else {
            parser.comment += '-' + c;
            parser.state = S.COMMENT;
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment');
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c;
            parser.state = S.COMMENT;
          } else {
            parser.state = S.TEXT;
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING;
          } else {
            parser.cdata += c;
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2;
          } else {
            parser.cdata += ']' + c;
            parser.state = S.CDATA;
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata);
            }
            emitNode(parser, 'onclosecdata');
            parser.cdata = '';
            parser.state = S.TEXT;
          } else if (c === ']') {
            parser.cdata += ']';
          } else {
            parser.cdata += ']]' + c;
            parser.state = S.CDATA;
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING;
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY;
          } else {
            parser.procInstName += c;
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING;
          } else {
            parser.procInstBody += c;
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            });
            parser.procInstName = parser.procInstBody = '';
            parser.state = S.TEXT;
          } else {
            parser.procInstBody += '?' + c;
            parser.state = S.PROC_INST_BODY;
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c;
          } else {
            newTag(parser);
            if (c === '>') {
              openTag(parser);
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH;
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name');
              }
              parser.state = S.ATTRIB;
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true);
            closeTag(parser);
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >');
            parser.state = S.ATTRIB;
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser);
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH;
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c;
            parser.attribValue = '';
            parser.state = S.ATTRIB_NAME;
          } else {
            strictFail(parser, 'Invalid attribute name');
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE;
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value');
            parser.attribValue = parser.attribName;
            attrib(parser);
            openTag(parser);
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE;
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c;
          } else {
            strictFail(parser, 'Invalid attribute name');
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE;
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value');
            parser.tag.attributes[parser.attribName] = '';
            parser.attribValue = '';
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            });
            parser.attribName = '';
            if (c === '>') {
              openTag(parser);
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c;
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, 'Invalid attribute name');
              parser.state = S.ATTRIB;
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c;
            parser.state = S.ATTRIB_VALUE_QUOTED;
          } else {
            strictFail(parser, 'Unquoted attribute value');
            parser.state = S.ATTRIB_VALUE_UNQUOTED;
            parser.attribValue = c;
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q;
            } else {
              parser.attribValue += c;
            }
            continue
          }
          attrib(parser);
          parser.q = '';
          parser.state = S.ATTRIB_VALUE_CLOSED;
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB;
          } else if (c === '>') {
            openTag(parser);
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH;
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes');
            parser.attribName = c;
            parser.attribValue = '';
            parser.state = S.ATTRIB_NAME;
          } else {
            strictFail(parser, 'Invalid attribute name');
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U;
            } else {
              parser.attribValue += c;
            }
            continue
          }
          attrib(parser);
          if (c === '>') {
            openTag(parser);
          } else {
            parser.state = S.ATTRIB;
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c;
                parser.state = S.SCRIPT;
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.');
              }
            } else {
              parser.tagName = c;
            }
          } else if (c === '>') {
            closeTag(parser);
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c;
          } else if (parser.script) {
            parser.script += '</' + parser.tagName;
            parser.tagName = '';
            parser.state = S.SCRIPT;
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag');
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE;
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser);
          } else {
            strictFail(parser, 'Invalid characters in closing tag');
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState;
          var buffer;
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT;
              buffer = 'textNode';
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED;
              buffer = 'attribValue';
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED;
              buffer = 'attribValue';
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser);
            parser.entity = '';
            parser.state = returnState;
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c;
          } else {
            strictFail(parser, 'Invalid character in entity name');
            parser[buffer] += '&' + parser.entity + c;
            parser.entity = '';
            parser.state = returnState;
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser);
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode;
      var floor = Math.floor;
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
          return ''
        }
        var result = '';
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint);
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = (codePoint % 0x400) + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result
      };
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        });
      } else {
        String.fromCodePoint = fromCodePoint;
      }
    }());
  }
})(exports);
}(sax$1));

Object.defineProperty(main,'__esModule',{value:true});var __assign=function(){return __assign=Object.assign||function(t){for(var e,r=1,n=arguments.length;r<n;r++)for(var o in e=arguments[r])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t},__assign.apply(this,arguments)};var DEFAULT_CONFIG={doctypeKey:"doctype",rootKey:"root",tagKey:"name",attrsKey:"attrs",contentKey:"value",childrenKey:"children",normalize:!0,lowerCaseTagsContent:!0,lowerCaseTagsNames:!1};var sax=sax$1;function xmlParser(e,n){void 0===e&&(e=""),void 0===n&&(n={});var t=__assign(__assign({},DEFAULT_CONFIG),n),o=!t.lowerCaseTagsNames,r=sax.parser(o,{trim:!0,normalize:t.normalize,lowercase:t.lowerCaseTagsNames}),a=[],s=null,i={},l={ondoctype:function(e){var n=t.doctypeKey,o=e.trim().match(/(\"[^\"]+\")|([^\s]+)/gi);i[n]=o;},onopentag:function(e){var n,o=e.name,r=e.attributes,l=t.tagKey,c=t.childrenKey,u=t.attrsKey,f=t.rootKey,g=((n={})[l]=o,n);this.tag.isSelfClosing&&(g.isSelfClosing=!0);Object.keys(r).length&&(g[u]=r);if(!s)return i[f||o]=s=g;null==s[c]&&(s[c]=[]);a.push(s),s[c].push(s=g);},onclosetag:function(e){s=a.pop();},ontext:function(e){if(!s)return;var n=t.lowerCaseTagsContent?e.trim().toLowerCase():e.trim();s[t.contentKey]=n||null;},oncdata:function(e){if(!s)return;var n=e.trim();n&&(s[t.contentKey]=n);},onclosecdata:function(){null==s[t.contentKey]&&(s[t.contentKey]=null);},onerror:function(e){console.error(e);}};return Object.assign(r,l),r.write(e).close(),i}var NodeModel=function(){function e(e){this.name=e.name,this.attrs=e.attrs,this.value=e.value,this.isSelfClosing=e.isSelfClosing,this.children=e.children;}return e.prototype.findNode=function(e){return this.children.find((function(r){return r.name==e}))},e.prototype.getChildValue=function(e){var r=this.findNode(e);if(r&&null!=r.value)return r.value},e}();main.NodeModel=NodeModel;var parseXml = main.parseXml=xmlParser;

function readBitsReversed(bin, count = 1) {
    let bits = 0;
    for (let i = 0; i < count; i++) {
        bits |= (bin.getUnsigned(1) << i);
    }
    return bits;
}
function getString(bin, offset, length) {
    bin.seek(offset);
    let buf = [];
    for (let i = 0; i < length; i++) {
        var code = bin.getUint8() & 0xFF;
        if (code == 0)
            break;
        buf.push(code);
    }
    return String.fromCharCode.apply(null, buf);
}

const jDataView = require('jdataview');
var FileTypes;
(function (FileTypes) {
    FileTypes["MiscXml"] = "misc.xml";
    FileTypes["ScoreGpif"] = "score.gpif";
})(FileTypes || (FileTypes = {}));
function decode(blob) {
    const bin = new jDataView(blob, 0, blob.length, true);
    const files = handleBlock(bin);
    return files
        .filter(isFileToStore)
        .map(mapFile)
        .reduce((files, file) => (files[file.name] = file.data, files), {});
    function mapFile(file) {
        switch (file.name) {
            case 'score.gpif':
            case 'misc.xml':
                if (!file.data) {
                    return file;
                }
                file.data = file.data.getString(file.data.byteLength, 0, 'utf-8');
        }
        return file;
    }
}
function handleBlock(bin) {
    const header = bin.getString(4);
    switch (header) {
        case "BCFZ":
            return parseBlock(decompressBlock(bin, true));
        case "BCFS":
            return parseBlock(bin);
        default:
            throw `Bad Header: ${header} (unsupported format)`;
    }
}
function parseBlock(bin) {
    const SECTOR_SIZE = 0x1000;
    let offset = SECTOR_SIZE;
    let files = [];
    while (offset + SECTOR_SIZE + 3 < bin.byteLength) {
        const entryType = bin.getUint32(offset, true);
        if (entryType == 2) {
            const file = {
                name: getString(bin, offset + 0x04, 127),
                size: bin.getUint32(offset + 0x8C, true)
            };
            files.push(file);
            const isStoreFile = isFileToStore(file);
            const blocksOffset = offset + 0x94;
            let dataBlocks = [];
            let blockCount = 0;
            let blockId = 0;
            while ((blockId = bin.getUint32(blocksOffset + 4 * blockCount, true)) != 0) {
                offset = blockId * SECTOR_SIZE;
                if (isStoreFile) {
                    const max = offset + SECTOR_SIZE;
                    const blockSize = max > bin.byteLength
                        ? SECTOR_SIZE - (max - bin.byteLength)
                        : SECTOR_SIZE;
                    dataBlocks.push(bin.getBytes(blockSize, offset));
                }
                blockCount++;
            }
            if (isStoreFile) {
                const fileDataSize = dataBlocks.reduce((size, block) => size += block.length, 0);
                const buffer = new jDataView(Math.max(file.size, fileDataSize));
                dataBlocks
                    .forEach(block => buffer.writeBytes(block));
                file.data = new jDataView(Math.min(file.size, fileDataSize));
                file.data.writeBytes(buffer.getBytes(file.data.byteLength, 0));
            }
        }
        offset += SECTOR_SIZE;
    }
    return files;
}
function decompressBlock(bin, isSkipHeader = false) {
    const expectedLength = bin.getUint32();
    const temp = new jDataView(expectedLength);
    let pos = 0;
    try {
        while (pos < expectedLength) {
            const flag = bin.getUnsigned(1);
            if (flag == 1) {
                const wordSize = bin.getUnsigned(4);
                const offset = readBitsReversed(bin, wordSize);
                const size = readBitsReversed(bin, wordSize);
                const sourcePosition = pos - offset;
                const readSize = Math.min(offset, size);
                const copy = temp.slice(sourcePosition, sourcePosition + readSize, false);
                temp.writeBytes(copy.getBytes(copy.byteLength, 0), pos);
                pos += copy.byteLength;
            }
            else {
                const size = readBitsReversed(bin, 2);
                for (let i = 0; i < size; i++) {
                    temp.writeUint8(bin.getUnsigned(8), pos++);
                }
            }
        }
    }
    catch (e) {
        console.error('End of Block Exception', e);
    }
    const resultOffset = isSkipHeader ? 4 : 0;
    const resultSize = temp.byteLength - resultOffset;
    return temp.slice(resultOffset, resultSize, false);
}
function isFileToStore(file) {
    switch (file.name) {
        case 'score.gpif':
        case 'misc.xml':
            return true;
        default:
            return false;
    }
}

function getChildren(node) {
    return node.children && node.children.length
        ? node.children
        : [];
}

const cursor = [];
const listNodes = [
    'masterbars',
    'masterbars.masterbar.xproperties',
    'masterbars.masterbar.directions',
    'masterbars.masterbar.fermatas',
    'mastertrack.automations',
    'mastertrack.rse.master',
    'mastertrack.rse.master.effect.automations',
    'tracks',
    'tracks.track.lyrics',
    'tracks.track.properties',
    'tracks.track.properties.property.items',
    'tracks.track.properties.property.items.item.diagram',
    'tracks.track.properties.property.items.item.diagram.fingering',
    'tracks.track.properties.property.items.item.chord',
    'tracks.track.rse.channelstrip.automations',
    'tracks.track.rse.effectchains',
    'tracks.track.rse.effectchains.effectchain.rail',
    'tracks.track.rse.pickups',
    'tracks.track.rse.bankchanges',
    'tracks.track.rse.bankchanges.bankchange.pickups',
    'bars',
    'bars.bar.xproperties',
    'beats',
    'beats.beat.properties',
    'beats.beat.xproperties',
    'beats.beat.lyrics',
    'rhythms',
    'voices',
    'notes',
    'notes.note.properties',
    'notes.note.xproperties'
];
const lowercaseNodes = [
    'tracks.track.properties.property.items.item.chord.keynote.attrs.accidental',
    'tracks.track.properties.property.items.item.chord.bassnote.attrs.accidental'
];
function gpifReducer(xmlTree) {
    return getChildren(xmlTree.root).reduce(defaultReducer, {});
}
function defaultReducer(res, node) {
    const path = cursor.push(node.name) && cursor.join('.');
    const data = mapNode(node, path);
    res[node.name] = data;
    cursor.pop();
    return res;
}
function listReducer(res, node, index) {
    const path = cursor.push(node.name) && cursor.join('.');
    const data = mapNode(node, path, true);
    if (data) {
        if (typeof data == 'object') {
            data.node = node.name;
        }
        res[index] = data;
    }
    cursor.pop();
    return res;
}
function mapNode(node, path, isListItem = false) {
    const { value, attrs, children } = node;
    let temp;
    switch (true) {
        case listNodes.includes(path):
            temp = {
                items: getChildren(node).reduce(listReducer, [])
            };
            break;
        case value !== undefined:
            let newValue = value === null
                ? void 0
                : value;
            if (lowercaseNodes.includes(path)) {
                newValue = newValue ? newValue.toLowerCase() : void 0;
            }
            temp = isListItem
                ? { node: node.name, value: newValue }
                : newValue;
            break;
        case !!children:
            temp = children.reduce(defaultReducer, {});
            break;
        default:
            temp = isListItem
                ? { node: node.name }
                : node.isSelfClosing
                    ? true
                    : '';
    }
    if (attrs && Object.keys(attrs).length) {
        const newAttrs = mapAttrs(attrs, path);
        temp = typeof temp == 'object'
            ? Object.assign({ attrs: newAttrs }, temp) : { attrs: newAttrs };
    }
    return temp;
}
function mapAttrs(attrs, path) {
    return Object.keys(attrs).reduce(attrsReducer, {});
    function attrsReducer(result, key) {
        const currentPath = `${path}.attrs.${key}`;
        let value = attrs[key];
        if (lowercaseNodes.includes(currentPath)) {
            value = value.toLowerCase();
        }
        result[key] = value;
        return result;
    }
}

var AutomationTypes;
(function (AutomationTypes) {
    AutomationTypes["MasterVolume"] = "dspparam_00";
    AutomationTypes["MasterPan"] = "dspparam_01";
})(AutomationTypes || (AutomationTypes = {}));
var BooleanString;
(function (BooleanString) {
    BooleanString["True"] = "true";
    BooleanString["False"] = "false";
})(BooleanString || (BooleanString = {}));
var Finger;
(function (Finger) {
    Finger["None"] = "None";
    Finger["Thumb"] = "Thumb";
    Finger["Index"] = "Index";
    Finger["Middle"] = "Middle";
    Finger["Ring"] = "Ring";
    Finger["Pinky"] = "Pinky";
})(Finger || (Finger = {}));
var Accidental;
(function (Accidental) {
    Accidental["Natural"] = "natural";
    Accidental["Flat"] = "flat";
    Accidental["Sharp"] = "sharp";
    Accidental["DoubleSharp"] = "doublesharp";
    Accidental["DoubleFlat"] = "doubleflat";
})(Accidental || (Accidental = {}));
var Step;
(function (Step) {
    Step["C"] = "C";
    Step["D"] = "D";
    Step["E"] = "E";
    Step["F"] = "F";
    Step["G"] = "G";
    Step["A"] = "A";
    Step["B"] = "B";
})(Step || (Step = {}));
var Interval;
(function (Interval) {
    Interval["Second"] = "Second";
    Interval["Third"] = "Third";
    Interval["Fourth"] = "Fourth";
    Interval["Fifth"] = "Fifth";
    Interval["Sixth"] = "Sixth";
    Interval["Seventh"] = "Seventh";
    Interval["Eighth"] = "Eighth";
    Interval["Ninth"] = "Ninth";
    Interval["Eleventh"] = "Eleventh";
    Interval["Thirteenth"] = "Thirteenth";
})(Interval || (Interval = {}));
var Alteration;
(function (Alteration) {
    Alteration["Minor"] = "Minor";
    Alteration["Perfect"] = "Perfect";
    Alteration["Major"] = "Major";
    Alteration["Diminished"] = "Diminished";
    Alteration["Augmented"] = "Augmented";
})(Alteration || (Alteration = {}));
var Ottavia;
(function (Ottavia) {
    Ottavia["OttavaAlta"] = "8va";
    Ottavia["Quindicesima"] = "15ma";
    Ottavia["OttavaBassa"] = "8vb";
    Ottavia["QuindicesimaBassa"] = "15mb";
})(Ottavia || (Ottavia = {}));
var UpDown;
(function (UpDown) {
    UpDown["Down"] = "down";
    UpDown["Up"] = "up";
})(UpDown || (UpDown = {}));
var Vibrato;
(function (Vibrato) {
    Vibrato["Slight"] = "slight";
    Vibrato["Wide"] = "wide";
})(Vibrato || (Vibrato = {}));

var MTAutomationTypes;
(function (MTAutomationTypes) {
    MTAutomationTypes["Tempo"] = "tempo";
})(MTAutomationTypes || (MTAutomationTypes = {}));
var MTEffects;
(function (MTEffects) {
    MTEffects["VolumeAndPan"] = "I01_VolumeAndPan";
    MTEffects["GraphicEQ10Band"] = "M08_GraphicEQ10Band";
    MTEffects["DynamicAnalogDynamic"] = "M06_DynamicAnalogDynamic";
    MTEffects["StudioReverbHallConcertHall"] = "M01_StudioReverbHallConcertHall";
    MTEffects["StudioReverbHallSmallTheater"] = "M02_StudioReverbHallSmallTheater";
    MTEffects["StudioReverbRoomStudioA"] = "M03_StudioReverbRoomStudioA";
    MTEffects["StudioReverbRoomAmbience"] = "M04_StudioReverbRoomAmbience";
    MTEffects["StudioReverbPlatePercussive"] = "M05_StudioReverbPlatePercussive";
})(MTEffects || (MTEffects = {}));

var FermataType;
(function (FermataType) {
    FermataType["Short"] = "short";
    FermataType["Medium"] = "medium";
    FermataType["Long"] = "long";
})(FermataType || (FermataType = {}));
var MusicalDirectionTarget;
(function (MusicalDirectionTarget) {
    MusicalDirectionTarget["Coda"] = "coda";
    MusicalDirectionTarget["DoubleCoda"] = "doublecoda";
    MusicalDirectionTarget["Segno"] = "segno";
    MusicalDirectionTarget["SegnoSegno"] = "segnosegno";
    MusicalDirectionTarget["Fine"] = "fine";
})(MusicalDirectionTarget || (MusicalDirectionTarget = {}));
var MusicalDirectionJump;
(function (MusicalDirectionJump) {
    MusicalDirectionJump["DaCapo"] = "dacapo";
    MusicalDirectionJump["DaCapoAlCoda"] = "dacapoalcoda";
    MusicalDirectionJump["DaCapoAlDoubleCoda"] = "dacapoaldoublecoda";
    MusicalDirectionJump["DaCapoAlFine"] = "dacapoalfine";
    MusicalDirectionJump["DaSegno"] = "dasegno";
    MusicalDirectionJump["DaSegnoAlCoda"] = "dasegnoalcoda";
    MusicalDirectionJump["DaSegnoAlDoubleCoda"] = "dasegnoaldoublecoda";
    MusicalDirectionJump["DaSegnoAlFine"] = "dasegnoalfine";
    MusicalDirectionJump["DaSegnoSegno"] = "dasegnosegno";
    MusicalDirectionJump["DaSegnoSegnoAlCoda"] = "dasegnosegnoalcoda";
    MusicalDirectionJump["DaSegnoSegnoAlDoubleCoda"] = "dasegnosegnoaldoublecoda";
    MusicalDirectionJump["DaSegnoSegnoAlFine"] = "dasegnosegnoalfine";
    MusicalDirectionJump["DaCoda"] = "dacoda";
    MusicalDirectionJump["DaDoubleCoda"] = "dadoublecoda";
})(MusicalDirectionJump || (MusicalDirectionJump = {}));
var KeyModes;
(function (KeyModes) {
    KeyModes["Minor"] = "minor";
    KeyModes["Major"] = "major";
})(KeyModes || (KeyModes = {}));
var TripletFeel;
(function (TripletFeel) {
    TripletFeel["Triplet8th"] = "triplet8th";
    TripletFeel["Triplet16th"] = "triplet16th";
    TripletFeel["Dotted8th"] = "dotted8th";
    TripletFeel["Dotted16th"] = "dotted16th";
    TripletFeel["Scottish8th"] = "scottish8th";
    TripletFeel["Scottish16th"] = "scottish16th";
})(TripletFeel || (TripletFeel = {}));

var Clef;
(function (Clef) {
    Clef["Neutral"] = "neutral";
    Clef["G2"] = "g2";
    Clef["C3"] = "c3";
    Clef["C4"] = "c4";
    Clef["F4"] = "f4";
})(Clef || (Clef = {}));
var SimileMark;
(function (SimileMark) {
    SimileMark["Simple"] = "simple";
    SimileMark["FirstOfDouble"] = "firstofdouble";
    SimileMark["SecondOfDouble"] = "secondofdouble";
})(SimileMark || (SimileMark = {}));

var PlaybackState;
(function (PlaybackState) {
    PlaybackState["Default"] = "default";
    PlaybackState["Mute"] = "mute";
    PlaybackState["Solo"] = "solo";
})(PlaybackState || (PlaybackState = {}));
var PlayingStyle;
(function (PlayingStyle) {
    PlayingStyle["Default"] = "default";
    PlayingStyle["StringedFinger"] = "stringedfinger";
    PlayingStyle["StringedFingerPicking"] = "stringedfingerpicking";
    PlayingStyle["StringePick"] = "stringedpick";
    PlayingStyle["DrumkitStick"] = "drumkitstick";
    PlayingStyle["DrumkitBrush"] = "drumkitbrush";
    PlayingStyle["DrumkitHotrod"] = "drumkithotrod";
    PlayingStyle["BassSlap"] = "bassslap";
})(PlayingStyle || (PlayingStyle = {}));
var MidiTables;
(function (MidiTables) {
    MidiTables["Instrument"] = "Instrument";
    MidiTables["Percussion"] = "Percussion";
})(MidiTables || (MidiTables = {}));
var TAutomationTypes;
(function (TAutomationTypes) {
    TAutomationTypes["TrackPan"] = "dspparam_11";
    TAutomationTypes["TrackVolume"] = "dspparam_12";
})(TAutomationTypes || (TAutomationTypes = {}));
var TrackEffects;
(function (TrackEffects) {
    TrackEffects["A01_ComboTop30"] = "A01_ComboTop30";
    TrackEffects["A04_ComboEddie"] = "A04_ComboEddie";
    TrackEffects["A07_StackRecti"] = "A07_StackRecti";
    TrackEffects["A08_StackModern"] = "A08_StackModern";
    TrackEffects["A09_StackOverloud"] = "A09_StackOverloud";
    TrackEffects["A15_LightBassLight"] = "A15_LightBassLight";
    TrackEffects["E01_OverdriveBlues"] = "E01_OverdriveBlues";
    TrackEffects["E02_OverdrivePreamp"] = "E02_OverdrivePreamp";
    TrackEffects["E06_DistortionRat"] = "E06_DistortionRat";
    TrackEffects["E07_DistortionGrunge"] = "E07_DistortionGrunge";
    TrackEffects["E12_FuzzFast"] = "E12_FuzzFast";
    TrackEffects["E14_FuzzBender"] = "E14_FuzzBender";
    TrackEffects["E15_ChorusEnsemble"] = "E15_ChorusEnsemble";
    TrackEffects["E17_ChorusBChorus"] = "E17_ChorusBChorus";
    TrackEffects["E18_FlangerMistress"] = "E18_FlangerMistress";
    TrackEffects["E20_Phaser90"] = "E20_Phaser90";
    TrackEffects["E22_VibratoVibe"] = "E22_VibratoVibe";
    TrackEffects["E23_TremoloOpto"] = "E23_TremoloOpto";
    TrackEffects["E28_PitchOctaver"] = "E28_PitchOctaver";
    TrackEffects["E30_EqGEq"] = "E30_EqGEq";
    TrackEffects["E31_EqBEq"] = "E31_EqBEq";
    TrackEffects["E32_EqAcoustic"] = "E32_EqAcoustic";
    TrackEffects["E33_WahAutoWah"] = "E33_WahAutoWah";
    TrackEffects["E35_WahBWah"] = "E35_WahBWah";
    TrackEffects["E36_WahJimi"] = "E36_WahJimi";
    TrackEffects["E40_Volume"] = "E40_Volume";
    TrackEffects["M08_GraphicEQ10Band"] = "M08_GraphicEQ10Band";
    TrackEffects["M09_GraphicEQ15Band"] = "M09_GraphicEQ15Band";
    TrackEffects["M11_DelayTapeDelay"] = "M11_DelayTapeDelay";
})(TrackEffects || (TrackEffects = {}));

var PropertyType;
(function (PropertyType) {
    PropertyType["Tuning"] = "Tuning";
    PropertyType["TuningFlat"] = "TuningFlat";
    PropertyType["AutoBrush"] = "AutoBrush";
    PropertyType["CapoFret"] = "CapoFret";
    PropertyType["PartialCapoFret"] = "PartialCapoFret";
    PropertyType["DiagramCollection"] = "DiagramCollection";
    PropertyType["DiagramWorkingSet"] = "DiagramWorkingSet";
    PropertyType["ChordCollection"] = "ChordCollection";
    PropertyType["ChordWorkingSet"] = "ChordWorkingSet";
})(PropertyType || (PropertyType = {}));

var Instrument;
(function (Instrument) {
    Instrument["AcousticBass"] = "a-bass4";
    Instrument["AcousticPiano"] = "a-piano-gs";
    Instrument["AgogoKit"] = "agogoKit";
    Instrument["Banjo4"] = "bnj4";
    Instrument["Banjo5D"] = "bnj5-d";
    Instrument["Banjo6"] = "bnj6";
    Instrument["BassSynthesizer"] = "snt-bass-gs";
    Instrument["BassTubainEb"] = "basstuba-eb";
    Instrument["Bassoon"] = "bassn";
    Instrument["BellTree"] = "bell-tree";
    Instrument["Bongos"] = "bngKit";
    Instrument["BongosNCongas"] = "conbon";
    Instrument["BrassSynthesizer"] = "snt-brass-gs";
    Instrument["Cabasa"] = "cbs";
    Instrument["Castanets"] = "cstnt";
    Instrument["Celesta"] = "clst-gs";
    Instrument["Cello"] = "cello";
    Instrument["Claves"] = "clvs";
    Instrument["Congas"] = "cngKit";
    Instrument["Contrabass"] = "ctbass";
    Instrument["Cowbell"] = "cowbell";
    Instrument["Cuica"] = "cuicaKit";
    Instrument["Drumkit"] = "drmkt";
    Instrument["ElectricBass"] = "e-bass4";
    Instrument["ElectricGuitar"] = "e-gtr6";
    Instrument["ElectricPiano"] = "e-piano-gs";
    Instrument["EnglishHorn"] = "en-horn";
    Instrument["Flute"] = "flt-c";
    Instrument["FrenchHorn"] = "fr-horn";
    Instrument["Guiro"] = "guiro";
    Instrument["HandClap"] = "hclap";
    Instrument["Harmonica"] = "harmo";
    Instrument["Harp"] = "harp-gs";
    Instrument["HarpSS"] = "harp-ss";
    Instrument["Harpsichord"] = "hrpch-gs";
    Instrument["JingleBell"] = "jngl-bell";
    Instrument["KeySynthesizer"] = "snt-key-gs";
    Instrument["KitAfrica"] = "africaKit";
    Instrument["KitLatino"] = "latinoKit";
    Instrument["KitSamba"] = "sambaKit";
    Instrument["LeadSynthesizer"] = "snt-lead-gs";
    Instrument["MaleSinger"] = "sprn-s";
    Instrument["Mandolin"] = "mndln8";
    Instrument["Maracas"] = "mrcs";
    Instrument["MelodicTom"] = "mldctm";
    Instrument["NylonGuitar"] = "n-gtr6";
    Instrument["Oboe"] = "oboe";
    Instrument["Organ"] = "em-organ-gs";
    Instrument["Piccolo"] = "pccl";
    Instrument["Recorder"] = "rec";
    Instrument["ReverseCymbal"] = "rvs-cymb";
    Instrument["SaxophoneSopranoinBb"] = "sax-sop-bb";
    Instrument["SequencerSynthesizer"] = "snt-seq-gs";
    Instrument["Shaker"] = "shkr";
    Instrument["SopranoClarinetC"] = "clrnt-c";
    Instrument["SteelGuitar"] = "s-gtr6";
    Instrument["Surdo"] = "surdo";
    Instrument["SynthDrum"] = "snthdrm";
    Instrument["SynthPadGS"] = "snt-pad-gs";
    Instrument["SynthPadSS"] = "snt-pad-ss";
    Instrument["SynthesizerBass"] = "s-bass4";
    Instrument["TaikoDrum"] = "taiko";
    Instrument["Tambourine"] = "tmbrn";
    Instrument["Timbale"] = "tmblKit";
    Instrument["Timpani"] = "tmpn";
    Instrument["Triangle"] = "trngl";
    Instrument["TromboneBbTreble"] = "trmbn-bb-treble";
    Instrument["Trumpet"] = "trmpt-c";
    Instrument["Ukulele"] = "ukll4";
    Instrument["Vibraphone"] = "vbrphn";
    Instrument["Vibraslap"] = "vbrslp";
    Instrument["Viola"] = "vla";
    Instrument["Violin"] = "vln";
    Instrument["Whistle"] = "whstlKit";
    Instrument["Woodblock"] = "wdblckKit";
    Instrument["Xylophone"] = "xlphn";
})(Instrument || (Instrument = {}));

var Dynamic;
(function (Dynamic) {
    Dynamic["ppp"] = "ppp";
    Dynamic["pp"] = "pp";
    Dynamic["p"] = "p";
    Dynamic["mp"] = "mp";
    Dynamic["mf"] = "mf";
    Dynamic["f"] = "f";
    Dynamic["ff"] = "ff";
    Dynamic["fff"] = "fff";
})(Dynamic || (Dynamic = {}));
var Hairpin;
(function (Hairpin) {
    Hairpin["Crescendo"] = "crescendo";
    Hairpin["Decrescendo"] = "decrescendo";
})(Hairpin || (Hairpin = {}));
var Tremolo;
(function (Tremolo) {
    Tremolo["One32nd"] = "1/8";
    Tremolo["One16th"] = "1/4";
    Tremolo["One8th"] = "1/2";
})(Tremolo || (Tremolo = {}));
var WahStatus;
(function (WahStatus) {
    WahStatus["Open"] = "open";
    WahStatus["Close"] = "close";
})(WahStatus || (WahStatus = {}));
var GracePosition;
(function (GracePosition) {
    GracePosition["BeforeBeat"] = "beforebeat";
    GracePosition["OnBeat"] = "onbeat";
})(GracePosition || (GracePosition = {}));
var Fadding;
(function (Fadding) {
    Fadding["FadeIn"] = "fadein";
    Fadding["FadeOut"] = "fadeout";
    Fadding["VolumeSwell"] = "volumeswell";
})(Fadding || (Fadding = {}));

var XProperties;
(function (XProperties) {
    XProperties["BrushDuration"] = "687935489";
    XProperties["BrushOffset"] = "687935490";
})(XProperties || (XProperties = {}));
var BeatPropertyType;
(function (BeatPropertyType) {
    BeatPropertyType["Rasgueado"] = "Rasgueado";
    BeatPropertyType["Brush"] = "Brush";
    BeatPropertyType["VibratoWTremBar"] = "VibratoWTremBar";
    BeatPropertyType["WhammyBar"] = "WhammyBar";
    BeatPropertyType["WhammyBarOriginValue"] = "WhammyBarOriginValue";
    BeatPropertyType["WhammyBarMiddleValue"] = "WhammyBarMiddleValue";
    BeatPropertyType["WhammyBarDestinationValue"] = "WhammyBarDestinationValue";
    BeatPropertyType["WhammyBarMiddleOffset1"] = "WhammyBarMiddleOffset1";
    BeatPropertyType["WhammyBarMiddleOffset2"] = "WhammyBarMiddleOffset2";
    BeatPropertyType["WhammyBarDestinationOffset"] = "WhammyBarDestinationOffset";
    BeatPropertyType["WhammyBarExtend"] = "WhammyBarExtend";
    BeatPropertyType["Popped"] = "Popped";
    BeatPropertyType["Slapped"] = "Slapped";
    BeatPropertyType["PickStroke"] = "PickStroke";
    BeatPropertyType["BarreFret"] = "BarreFret";
    BeatPropertyType["BarreString"] = "BarreString";
})(BeatPropertyType || (BeatPropertyType = {}));
var RasgueadoPatterns;
(function (RasgueadoPatterns) {
    RasgueadoPatterns["ii"] = "ii_1";
    RasgueadoPatterns["mi"] = "mi_1";
    RasgueadoPatterns["mii_triplet"] = "mii_1";
    RasgueadoPatterns["mii_anapaest"] = "mii_2";
    RasgueadoPatterns["pmp_triplet"] = "pmp_1";
    RasgueadoPatterns["pmp_anapaest"] = "pmp_2";
    RasgueadoPatterns["pei_triplet"] = "pei_1";
    RasgueadoPatterns["pei_anapaest"] = "pei_2";
    RasgueadoPatterns["pai_triplet"] = "pai_1";
    RasgueadoPatterns["pai_anapaest"] = "pai_2";
    RasgueadoPatterns["ami_triplet"] = "ami_1";
    RasgueadoPatterns["ami_anapaest"] = "ami_2";
    RasgueadoPatterns["ppp"] = "ppp_1";
    RasgueadoPatterns["amii"] = "amii_1";
    RasgueadoPatterns["amip"] = "amip_1";
    RasgueadoPatterns["eami"] = "eami_1";
    RasgueadoPatterns["eamii"] = "eamii_1";
    RasgueadoPatterns["peami"] = "peami_1";
})(RasgueadoPatterns || (RasgueadoPatterns = {}));

var Ornament;
(function (Ornament) {
    Ornament["UpperMordent"] = "uppermordent";
    Ornament["LowerMordent"] = "lowermordent";
    Ornament["Turn"] = "turn";
    Ornament["InvertedTurn"] = "invertedturn";
})(Ornament || (Ornament = {}));
var Fingering;
(function (Fingering) {
    Fingering["Open"] = "open";
    Fingering["Thumb"] = "p";
    Fingering["Index"] = "i";
    Fingering["Middle"] = "m";
    Fingering["Ring"] = "a";
    Fingering["Pinky"] = "c";
})(Fingering || (Fingering = {}));
var Accentuation;
(function (Accentuation) {
    Accentuation[Accentuation["Staccato"] = 1] = "Staccato";
    Accentuation[Accentuation["Normal"] = 4] = "Normal";
    Accentuation[Accentuation["Heavy"] = 8] = "Heavy";
})(Accentuation || (Accentuation = {}));
var Antiaccent;
(function (Antiaccent) {
    Antiaccent["Normal"] = "normal";
})(Antiaccent || (Antiaccent = {}));

var Duration;
(function (Duration) {
    Duration["Whole"] = "whole";
    Duration["Half"] = "half";
    Duration["Quarter"] = "quarter";
    Duration["Eighth"] = "eighth";
    Duration["One16th"] = "16th";
    Duration["One32nd"] = "32nd";
    Duration["One64th"] = "64th";
    Duration["One128th"] = "128th";
})(Duration || (Duration = {}));

function parseGpx(blob) {
    const internalFiles = decode(blob);
    const mainFile = internalFiles[FileTypes.ScoreGpif];
    const xmlTree = parseXml(mainFile, {
        lowerCaseTagsNames: true
    });
    return {
        gpif: gpifReducer(xmlTree),
        xml: {
            gpif: mainFile
        }
    };
}

var data$i = { $id:"/gpx-root",
  type:"object",
  required:[ "gpif" ],
  properties:{ gpif:{ $ref:"/gpif" } } };
data$i.$id;
data$i.type;
data$i.required;
data$i.properties;

var data$h = { $id:"/gpif",
  type:"object",
  additionalProperties:false,
  required:[ "gprevision",
    "score",
    "mastertrack",
    "masterbars",
    "tracks",
    "bars",
    "voices",
    "beats",
    "notes",
    "rhythms" ],
  properties:{ gprevision:{ type:"string",
      typecast:{ type:"number" } },
    score:{ $ref:"/gpif/score" },
    mastertrack:{ $ref:"/gpif/master-track" },
    masterbars:{ $ref:"#/definitions/List<MasterBar>" },
    tracks:{ $ref:"#/definitions/List<Track>" },
    bars:{ $ref:"#/definitions/List<Bar>" },
    voices:{ $ref:"#/definitions/List<Voice>" },
    beats:{ $ref:"#/definitions/List<Beat>" },
    notes:{ $ref:"#/definitions/List<Note>" },
    rhythms:{ $ref:"#/definitions/List<Rhythm>" } },
  definitions:{ "List<MasterBar>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/master-bar" } } } },
    "List<Track>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/track" } } } },
    "List<Bar>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/bar" } } } },
    "List<Voice>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/voice" } } } },
    "List<Beat>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/beat" } } } },
    "List<Note>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/note" } } } },
    "List<Rhythm>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/rhythm" } } } } } };
data$h.$id;
data$h.type;
data$h.additionalProperties;
data$h.required;
data$h.properties;
data$h.definitions;

var data$g = { $id:"/gpif/common",
  definitions:{ Lyrics:{ type:"object",
      additionalProperties:false,
      required:[ "items" ],
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ dispatched:{ type:"string",
              typecast:{ type:"boolean" } } } },
        items:{ type:"array",
          items:{ $ref:"#/definitions/LyricsLine" } } } },
    LyricsLine:{ type:"object",
      additionalProperties:false,
      required:[ "node" ],
      properties:{ node:{ constant:"line" },
        offset:{ type:"string",
          typecast:{ type:"integer" } },
        text:{ type:[ "string",
            "boolean" ] },
        value:{ type:"string" } } },
    Ottavia:{ type:"string",
      "enum":[ "8va",
        "8vb",
        "15ma",
        "15mb" ] } } };
data$g.$id;
data$g.definitions;

var data$f = { $id:"/gpif/props",
  definitions:{ BooleanProperty:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        enable:{ type:"boolean" } } },
    FloatProperty:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        "float":{ type:"string",
          typecast:{ type:"float" } } } },
    FretProperty:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        fret:{ type:"string",
          typecast:{ type:"integer" } } } },
    StringProperty:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        string:{ type:"string",
          typecast:{ type:"float" } } } },
    XProperty:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"xproperty" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ id:{ type:"string" } } },
        "int":{ type:"string" },
        "float":{ type:"string" },
        "double":{ type:"string" } } },
    "List<XProperty>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/props#/definitions/XProperty" } } } } } };
data$f.$id;
data$f.definitions;

var data$e = { $id:"/gpif/score",
  type:"object",
  additionalProperties:false,
  properties:{ title:{ type:"string" },
    subtitle:{ type:"string" },
    artist:{ type:"string" },
    album:{ type:"string" },
    words:{ type:"string" },
    music:{ type:"string" },
    wordsandmusic:{ type:"string" },
    copyright:{ type:"string" },
    tabber:{ type:"string" },
    instructions:{ type:"string" },
    notices:{ type:"string" },
    multivoice:{ type:"string",
      "enum":[ "0>",
        "1>" ] },
    firstpagefooter:{},
    firstpageheader:{},
    pageheader:{},
    pagefooter:{},
    pagesetup:{},
    scoresystemsdefaultlayout:{},
    scoresystemslayout:{} } };
data$e.$id;
data$e.type;
data$e.additionalProperties;
data$e.properties;

var data$d = { $id:"/gpif/rse",
  type:"object",
  additionalProperties:false,
  properties:{ bank:{ type:"string" },
    channelstrip:{ $ref:"#/definitions/Channelstrip" },
    effectchains:{ $ref:"#/definitions/List<EffectChain>" },
    bankchanges:{ $ref:"#/definitions/List<BankChange>" },
    pickups:{ $ref:"#/definitions/List<Pickup>" } },
  definitions:{ Channelstrip:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ version:{ type:"string",
              "enum":[ "E56" ] } } },
        automations:{ $ref:"#/definitions/List<Automation>" },
        parameters:{ type:"string" },
        bypassedautomations:{ type:"string",
          pattern:"^(dspparam_11|dspparam_12|[\\s])+$" } } },
    EffectChain:{ type:"object",
      additionalProperties:false,
      properties:{ name:{ type:"string" },
        node:{ constant:"effectchain" },
        rail:{ $ref:"#/definitions/Rail" } } },
    Rail:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ name:{ type:"string" } } },
        items:{ type:"array",
          items:{ $ref:"#/definitions/RailEffect" } } } },
    RailEffect:{ allOf:[ { $ref:"#/definitions/Effect" },
        { type:"object",
          properties:{ attrs:{ type:"object",
              additionalProperties:false,
              properties:{ id:{ type:"string" } } } } } ] },
    Effect:{ type:"object",
      additionalProperties:false,
      required:[ "node" ],
      properties:{ node:{ constant:"effect" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ id:{ type:"string" } } },
        bypass:{ type:"boolean" },
        bypassedautomations:{ type:"string",
          pattern:"^(dspparam_00|dspparam_01|dspparam_11|dspparam_12)+$" },
        parameters:{ type:"string",
          numbersString:true },
        automations:{ $ref:"#/definitions/List<Automation>" } } },
    Automation:{ type:"object",
      additionalProperties:false,
      required:[ "node",
        "type",
        "bar",
        "position",
        "value" ],
      properties:{ node:{ "const":"automation" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ id:{ type:"string" } } },
        type:{ type:"string",
          "enum":[ "tempo",
            "dspparam_00",
            "dspparam_01",
            "dspparam_11",
            "dspparam_12" ] },
        linear:{ type:"string",
          typecast:{ type:"boolean" } },
        visible:{ type:"string",
          typecast:{ type:"boolean" } },
        bar:{ type:"string",
          typecast:{ type:"integer" } },
        position:{ type:"string",
          typecast:{ type:"float",
            minimum:0,
            maximum:1 } },
        text:{ type:"string" },
        value:{ type:"string",
          numbersString:true } } },
    Pickup:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"pickup" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ id:{ type:"string" },
            tone:{ type:"string",
              typecast:{ type:"float" } },
            volume:{ type:"string",
              typecast:{ type:"float" } } } } } },
    BankChange:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"bankchange" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ barindex:{ type:"string",
              typecast:{ type:"integer" } },
            tickoffset:{ type:"string",
              typecast:{ type:"integer" } },
            bankid:{ type:"string" } } },
        pickups:{ $ref:"#/definitions/List<Pickup>" } } },
    "List<Automation>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/Automation" } } } },
    "List<EffectChain>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/EffectChain" } } } },
    "List<Pickup>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/Pickup" } } } },
    "List<BankChange>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/BankChange" } } } } } };
data$d.$id;
data$d.type;
data$d.additionalProperties;
data$d.properties;
data$d.definitions;

var data$c = { $id:"/gpif/chord-collection",
  type:"object",
  properties:{ items:{ type:"array",
      items:{ $ref:"#/definitions/ChordCollectionItem" } } },
  definitions:{ ChordCollectionItem:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"item" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ id:{ type:"string" },
            name:{ type:"string" } } },
        chord:{ $ref:"#/definitions/Chord" } } },
    Chord:{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/ChordPart" } } } },
    ChordPart:{ type:"object",
      properties:{ node:{ type:"string",
          "enum":[ "keynote",
            "bassnote",
            "degree" ] } },
      select:{ $data:"0/node" },
      selectCases:{ keynote:{ $ref:"/gpif/chord-collection#/definitions/KeyNote" },
        bassnote:{ $ref:"/gpif/chord-collection#/definitions/BassNote" },
        degree:{ $ref:"/gpif/chord-collection#/definitions/Degree" } } },
    KeyNote:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"keynote" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ accidental:{ $ref:"#/definitions/Accidental" },
            step:{ $ref:"#/definitions/Step" } } } } },
    BassNote:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"bassnote" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ accidental:{ $ref:"#/definitions/Accidental" },
            step:{ $ref:"#/definitions/Step" } } } } },
    Degree:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"degree" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ alteration:{ type:"string",
              "enum":[ "Perfect",
                "Minor",
                "Major",
                "Diminished",
                "Augmented" ] },
            interval:{ type:"string",
              "enum":[ "Second",
                "Third",
                "Fourth",
                "Fifth",
                "Sixth",
                "Seventh",
                "Eighth",
                "Ninth",
                "Eleventh",
                "Thirteenth" ] },
            omitted:{ type:"string",
              typecast:{ type:"boolean" } } } } } },
    Accidental:{ type:"string",
      "enum":[ "natural",
        "flat",
        "sharp",
        "doublesharp",
        "doubleflat" ] },
    Step:{ type:"string",
      pattern:"^[A-G]$" } } };
data$c.$id;
data$c.type;
data$c.properties;
data$c.definitions;

var data$b = { $id:"/gpif/diagram-collection",
  properties:{ items:{ type:"array",
      items:{ $ref:"#/definitions/DiagramCollectionItem" } } },
  definitions:{ DiagramCollectionItem:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"item" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ id:{ type:"string" },
            name:{ type:"string" } } },
        diagram:{ $ref:"#/definitions/Diagram" },
        chord:{ $ref:"/gpif/chord-collection#/definitions/Chord" } } },
    Diagram:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ barsstates:{ type:"string",
              numbersString:true },
            basefret:{ type:"string",
              typecast:{ type:"integer" } },
            fretcount:{ type:"string",
              typecast:{ type:"integer" } },
            stringcount:{ type:"string",
              typecast:{ type:"integer" } } } },
        items:{ type:"array",
          items:{ $ref:"#/definitions/DiagramPart" } } } },
    DiagramPart:{ type:"object",
      properties:{ node:{ type:"string",
          "enum":[ "property",
            "fingering",
            "fret" ] } },
      select:{ $data:"0/node" },
      selectCases:{ property:{ $ref:"/gpif/diagram-collection#/definitions/DiagramProperty" },
        fingering:{ $ref:"/gpif/diagram-collection#/definitions/Fingering" },
        fret:{ $ref:"/gpif/diagram-collection#/definitions/Fret" } } },
    DiagramProperty:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"property" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ name:{ type:"string",
              "enum":[ "ShowFingering" ] },
            type:{ type:"string",
              "enum":[ "bool" ] },
            value:{ type:"string",
              typecast:{ type:"boolean" } } } } } },
    Fret:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"fret" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ fret:{ type:"string",
              typecast:{ type:"integer" } },
            string:{ type:"string",
              typecast:{ type:"integer" } } } } } },
    Fingering:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"fingering" },
        items:{ type:"array",
          items:{ $ref:"#/definitions/Position" } } } },
    Position:{ type:"object",
      additionalProperties:false,
      properties:{ node:{ constant:"position" },
        attrs:{ type:"object",
          additionalProperties:false,
          properties:{ finger:{ type:"string",
              "enum":[ "Thumb",
                "Index",
                "Middle",
                "Ring",
                "Pinky",
                "None" ] },
            fret:{ type:"string",
              typecast:{ type:"integer" } },
            string:{ type:"string",
              typecast:{ type:"integer" } } } } } } } };
data$b.$id;
data$b.properties;
data$b.definitions;

var data$a = { $id:"/gpif/master-track",
  type:"object",
  additionalProperties:false,
  required:[ "tracks" ],
  properties:{ anacrusis:{ type:"boolean" },
    tracks:{ type:"string",
      numbersString:true },
    automations:{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/MasterAutomation" } } } },
    rse:{ $ref:"#/definitions/MasterRse" } },
  definitions:{ MasterRse:{ type:"object",
      additionalProperties:false,
      required:[ "master" ],
      properties:{ master:{ type:"object",
          properties:{ items:{ type:"array",
              items:{ $ref:"#/definitions/MasterEffect" } } } } } },
    MasterAutomation:{ allOf:[ { $ref:"/gpif/rse#/definitions/Automation" },
        { type:"object",
          properties:{ type:{ constant:"tempo" } } } ] },
    MasterEffect:{ allOf:[ { $ref:"/gpif/rse#/definitions/Effect" },
        { type:"object",
          properties:{ attrs:{ type:"object",
              additionalProperties:false,
              properties:{ id:{ type:"string",
                  "enum":[ "I01_VolumeAndPan",
                    "M01_StudioReverbHallConcertHall",
                    "M02_StudioReverbHallSmallTheater",
                    "M03_StudioReverbRoomStudioA",
                    "M04_StudioReverbRoomAmbience",
                    "M05_StudioReverbPlatePercussive",
                    "M06_DynamicAnalogDynamic",
                    "M08_GraphicEQ10Band" ] } } } } } ] } } };
data$a.$id;
data$a.type;
data$a.additionalProperties;
data$a.required;
data$a.properties;
data$a.definitions;

var data$9 = { $id:"/gpif/master-bar",
  type:"object",
  additionalProperties:false,
  required:[ "bars" ],
  properties:{ node:{ constant:"masterbar" },
    alternateendings:{ type:"string",
      numbersString:true },
    bars:{ type:"string",
      numbersString:true },
    time:{ type:"string",
      pattern:"^[0-9]{1,2}\\/[0-9]{1,3}$" },
    freetime:{ type:"boolean" },
    doublebar:{ type:"boolean" },
    tripletfeel:{ type:"string",
      "enum":[ "triplet8th",
        "triplet16th",
        "dotted16th",
        "dotted8th",
        "scottish8th",
        "scottish16th" ] },
    key:{ $ref:"#/definitions/Key" },
    repeat:{ $ref:"#/definitions/Repeat" },
    section:{ $ref:"#/definitions/Section" },
    fermatas:{ $ref:"#/definitions/List<Fermata>" },
    xproperties:{ $ref:"/gpif/props#/definitions/List<XProperty>" },
    directions:{ $ref:"#/definitions/List<Direction>" } },
  definitions:{ Key:{ type:"object",
      additionalProperties:false,
      required:[ "accidentalcount",
        "mode" ],
      properties:{ accidentalcount:{ type:"string",
          typecast:{ type:"integer",
            minimum:-7,
            maximum:7 } },
        mode:{ type:"string",
          "enum":[ "minor",
            "major" ] } } },
    Repeat:{ type:"object",
      additionalProperties:false,
      required:[ "attrs" ],
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          required:[ "start",
            "end" ],
          properties:{ count:{ type:"string",
              typecast:{ type:"integer" } },
            end:{ type:"string",
              typecast:{ type:"boolean" } },
            start:{ type:"string",
              typecast:{ type:"boolean" } } } } } },
    Section:{ type:"object",
      additionalProperties:false,
      properties:{ letter:{ type:"string" },
        text:{ type:"string" } } },
    Fermata:{ type:"object",
      additionalProperties:false,
      required:[ "node",
        "type",
        "offset",
        "length" ],
      properties:{ node:{ constant:"fermata" },
        type:{ type:"string",
          "enum":[ "medium",
            "long",
            "short" ] },
        offset:{ type:"string",
          pattern:"^[0-9]{1,2}\\/[0-9]{1,2}$" },
        length:{ type:"string",
          typecast:{ type:"float",
            minimum:0,
            maximum:1 } } } },
    Direction:{ type:"object",
      additionalProperties:false,
      required:[ "node",
        "value" ],
      properties:{ node:{ type:"string",
          "enum":[ "target",
            "jump" ] },
        value:{ type:"string",
          "enum":[ "dacapo",
            "dacoda",
            "dadoublecoda",
            "dacapoalfine",
            "dacapoalcoda",
            "dacapoaldoublecoda",
            "dasegno",
            "dasegnosegno",
            "dasegnoalfine",
            "dasegnoalcoda",
            "dasegnoaldoublecoda",
            "dasegnosegnoalfine",
            "dasegnosegnoalcoda",
            "dasegnosegnoaldoublecoda",
            "fine",
            "segno",
            "coda",
            "segnosegno",
            "doublecoda" ] } } },
    "List<Fermata>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/Fermata" } } } },
    "List<Direction>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/Direction" } } } },
    "List<MasterBarXProperty>":{ type:"object",
      properties:{ items:{ type:"array",
          items:{ $ref:"#/definitions/MasterBarXProperty" } } } } } };
data$9.$id;
data$9.type;
data$9.additionalProperties;
data$9.required;
data$9.properties;
data$9.definitions;

var data$8 = { $id:"/gpif/track",
  type:"object",
  additionalProperties:false,
  properties:{ node:{ constant:"track" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ id:{ type:"string" } } },
    name:{ type:"string" },
    shortname:{ type:"string" },
    color:{ type:"string",
      pattern:"^[0-9]{1,3} [0-9]{1,3} [0-9]{1,3}$" },
    playbackstate:{ type:"string",
      "enum":[ "default",
        "mute",
        "solo" ] },
    playingstyle:{ type:"string",
      "enum":[ "default",
        "stringedfinger",
        "stringedpick",
        "stringedfingerpicking",
        "drumkitstick",
        "drumkitbrush",
        "drumkithotrod",
        "bassslap" ] },
    palmmute:{ type:"string",
      typecast:{ type:"float" } },
    letringthroughout:{ type:"boolean" },
    autoaccentuation:{ type:"string",
      typecast:{ type:"float" } },
    systemsdefautlayout:{ type:"string",
      typecast:{ type:"integer" } },
    systemslayout:{ type:"string",
      numbersString:true },
    lyrics:{ $ref:"/gpif/common#/definitions/Lyrics" },
    rse:{ $ref:"/gpif/rse" },
    properties:{ $ref:"#/definitions/List<TrackProperty>" },
    generalmidi:{ $ref:"#/definitions/GeneralMidi" },
    instrument:{ $ref:"#/definitions/Instrument" },
    partsounding:{ $ref:"#/definitions/Partsounding" } },
  definitions:{ GeneralMidi:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ table:{ type:"string",
              "enum":[ "Instrument",
                "Percussion" ] } } },
        port:{ type:"string",
          typecast:{ type:"integer",
            minimum:0,
            maximum:3 } },
        primarychannel:{ type:"string",
          typecast:{ type:"integer",
            minimum:0,
            maximum:16 } },
        program:{ type:"string",
          typecast:{ type:"integer",
            minimum:0,
            maximum:127 } },
        secondarychannel:{ type:"string",
          typecast:{ type:"integer",
            minimum:0,
            maximum:16 } },
        foreonechannelperstring:{ type:"string",
          typecast:{ type:"boolean" } } } },
    Instrument:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ ref:{ type:"string" } } } } },
    Partsounding:{ type:"object",
      additionalProperties:false,
      properties:{ nominalkey:{ type:"string",
          pattern:"^neutral|([b]?[a-g](\\s(bass|alto|soprano|sopranino|baritone|tenor))?)$" },
        transpositionpitch:{ type:"string",
          typecast:{ type:"integer" } } } },
    "List<TrackProperty>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/track-property" } } } } } };
data$8.$id;
data$8.type;
data$8.additionalProperties;
data$8.properties;
data$8.definitions;

var data$7 = { $id:"/gpif/track-property",
  type:"object",
  properties:{ node:{ constant:"property" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ name:{ type:"string",
          "enum":[ "Tuning",
            "TuningFlat",
            "AutoBrush",
            "CapoFret",
            "PartialCapoFret",
            "PartialCapoStringFlags",
            "DiagramCollection",
            "DiagramWorkingSet",
            "ChordCollection",
            "ChordWorkingSet" ] } } } },
  select:{ $data:"0/attrs/name" },
  selectCases:{ AutoBrush:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    Tuning:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        pitches:{ type:"string",
          pattern:"^([0-9]+|\\s)+$" } } },
    TuningFlat:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    CapoFret:{ $ref:"/gpif/props#/definitions/FretProperty" },
    PartialCapoFret:{ $ref:"/gpif/props#/definitions/FretProperty" },
    PartialCapoStringFlags:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        flags:{ type:"string",
          typecast:{ type:"integer" } } } },
    DiagramCollection:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        items:{ $ref:"/gpif/diagram-collection" } } },
    DiagramWorkingSet:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        items:{ $ref:"/gpif/diagram-collection" } } },
    ChordCollection:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        items:{ $ref:"/gpif/chord-collection" } } },
    ChordWorkingSet:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        items:{ $ref:"/gpif/chord-collection" } } } } };
data$7.$id;
data$7.type;
data$7.properties;
data$7.select;
data$7.selectCases;

var data$6 = { $id:"/gpif/bar",
  type:"object",
  additionalProperties:false,
  properties:{ node:{ constant:"bar" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ id:{ type:"string" } } },
    clef:{ type:"string",
      "enum":[ "neutral",
        "g2",
        "c3",
        "c4",
        "f4" ] },
    ottavia:{ $ref:"/gpif/common#/definitions/Ottavia" },
    similemark:{ type:"string",
      "enum":[ "simple",
        "firstofdouble",
        "secondofdouble" ] },
    voices:{ type:"string",
      numbersString:true },
    xproperties:{ $ref:"/gpif/props#/definitions/List<XProperty>" } } };
data$6.$id;
data$6.type;
data$6.additionalProperties;
data$6.properties;

var data$5 = { $id:"/gpif/beat",
  type:"object",
  additionalProperties:false,
  properties:{ node:{ constant:"beat" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ id:{ type:"string" } } },
    freetext:{ type:"string" },
    dynamic:{ type:"string",
      "enum":[ "ppp",
        "pp",
        "p",
        "mp",
        "mf",
        "f",
        "ff",
        "fff" ] },
    ottavia:{ $ref:"/gpif/common#/definitions/Ottavia" },
    hairpin:{ type:"string",
      "enum":[ "crescendo",
        "decrescendo" ] },
    arpeggio:{ type:"string",
      "enum":[ "down",
        "up" ] },
    fadding:{ type:"string",
      "enum":[ "fadein",
        "fadeout",
        "volumeswell" ] },
    slashed:{ type:"boolean" },
    bank:{ type:"string" },
    timer:{ type:"string",
      typecast:{ type:"integer" } },
    tremolo:{ type:"string",
      "enum":[ "1/2",
        "1/4",
        "1/8" ] },
    variation:{ type:"string",
      typecast:{ type:"integer" } },
    wah:{ type:"string",
      "enum":[ "open",
        "closed" ] },
    gracenotes:{ type:"string",
      "enum":[ "beforebeat",
        "onbeat" ] },
    notes:{ type:"string",
      numbersString:true },
    chord:{ type:"string",
      numbersString:"string" },
    legato:{ $ref:"#/definitions/Legato" },
    rhythm:{ $ref:"#/definitions/RhythmLink" },
    lyrics:{ $ref:"/gpif/common#/definitions/Lyrics" },
    xproperties:{ $ref:"/gpif/props#/definitions/List<XProperty>" },
    properties:{ $ref:"#/definitions/List<BeatProperty>" } },
  definitions:{ RhythmLink:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ ref:{ type:"string" } } } } },
    Legato:{ type:"object",
      additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ origin:{ type:"string",
              typecast:{ type:"boolean" } },
            destination:{ type:"string",
              typecast:{ type:"boolean" } } } } } },
    "List<BeatProperty>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/beat-property" } } } } } };
data$5.$id;
data$5.type;
data$5.additionalProperties;
data$5.properties;
data$5.definitions;

var data$4 = { $id:"/gpif/beat-property",
  type:"object",
  properties:{ node:{ constant:"property" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ name:{ type:"string",
          "enum":[ "Brush",
            "Rasgueado",
            "Popped",
            "Slapped",
            "PickStroke",
            "BarreFret",
            "BarreString",
            "VibratoWTremBar",
            "WhammyBar",
            "WhammyBarOriginValue",
            "WhammyBarOriginOffset",
            "WhammyBarMiddleValue",
            "WhammyBarMiddleOffset1",
            "WhammyBarMiddleOffset2",
            "WhammyBarDestinationValue",
            "WhammyBarDestinationOffset",
            "WhammyBarExtend" ] } } } },
  select:{ $data:"0/attrs/name" },
  selectCases:{ WhammyBar:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    WhammyBarExtend:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    WhammyBarOriginValue:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    WhammyBarOriginOffset:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    WhammyBarMiddleValue:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    WhammyBarMiddleOffset1:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    WhammyBarMiddleOffset2:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    WhammyBarDestinationValue:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    WhammyBarDestinationOffset:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    Brush:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        direction:{ type:"string",
          "enum":[ "up",
            "down" ] } } },
    PickStroke:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        direction:{ type:"string",
          "enum":[ "up",
            "down" ] } } },
    Rasgueado:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        rasgueado:{ type:"string",
          "enum":[ "ii_1",
            "mi_1",
            "mii_1",
            "mii_2",
            "pmp_1",
            "pmp_2",
            "pei_1",
            "pei_2",
            "pai_1",
            "pai_2",
            "ami_1",
            "ami_2",
            "ppp_1",
            "amii_1",
            "amip_1",
            "eami_1",
            "eamii_1",
            "peami_1" ] } } },
    Popped:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    Slapped:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    BarreFret:{ $ref:"/gpif/props#/definitions/FretProperty" },
    BarreString:{ $ref:"/gpif/props#/definitions/StringProperty" },
    VibratoWTremBar:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        strength:{ type:"string",
          "enum":[ "slight",
            "wide" ] } } } } };
data$4.$id;
data$4.type;
data$4.properties;
data$4.select;
data$4.selectCases;

var data$3 = { $id:"/gpif/voice",
  type:"object",
  additionalProperties:false,
  properties:{ node:{ constant:"voice" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ id:{ type:"string" } } },
    beats:{ type:"string",
      numbersString:true } } };
data$3.$id;
data$3.type;
data$3.additionalProperties;
data$3.properties;

var data$2 = { $id:"/gpif/note",
  type:"object",
  additionalProperties:false,
  properties:{ node:{ constant:"note" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ id:{ type:"string" } } },
    letring:{ type:"boolean" },
    vibrato:{ type:"string",
      "enum":[ "slight",
        "wide" ] },
    trill:{ type:"string",
      typecast:{ type:"integer",
        minimum:37,
        maximum:100 } },
    accent:{ type:"string",
      typecast:{ type:"float" } },
    ornament:{ type:"string",
      "enum":[ "uppermordent",
        "lowermordent",
        "turn",
        "invertedturn" ] },
    antiaccent:{ type:"string",
      "enum":[ "normal" ] },
    leftfingering:{ type:"string",
      "enum":[ "open",
        "p",
        "i",
        "m",
        "a",
        "c" ] },
    rightfingering:{ type:"string",
      "enum":[ "open",
        "p",
        "i",
        "m",
        "a",
        "c" ] },
    accidental:{ type:"string",
      "enum":[ "natural",
        "sharp",
        "flat",
        "doublesharp",
        "doubleflat" ] },
    tie:{ type:"object",
      properties:{ attrs:{ type:"object",
          properties:{ origin:{ type:"string",
              typecast:{ type:"boolean" } },
            destination:{ type:"string",
              typecast:{ type:"boolean" } } } } } },
    glide:{ type:"object",
      properties:{ type:{ type:"string",
          "enum":[ "None" ] },
        origin:{ type:"string",
          typecast:{ type:"integer" } },
        destination:{ type:"string",
          typecast:{ type:"integer" } } } },
    xproperties:{ $ref:"/gpif/props#/definitions/List<XProperty>" },
    properties:{ $ref:"#/definitions/List<NoteProperty>" } },
  definitions:{ "List<NoteProperty>":{ type:"object",
      additionalProperties:false,
      properties:{ items:{ type:"array",
          items:{ $ref:"/gpif/note-property" } } } } } };
data$2.$id;
data$2.type;
data$2.additionalProperties;
data$2.properties;
data$2.definitions;

var data$1 = { $id:"/gpif/note-property",
  type:"object",
  properties:{ node:{ constant:"property" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ name:{ type:"string",
          "enum":[ "String",
            "Fret",
            "HarmonicType",
            "HarmonicFret",
            "Muted",
            "PalmMuted",
            "Slide",
            "HopoOrigin",
            "HopoDestination",
            "Bended",
            "BendOriginValue",
            "BendOriginOffset",
            "BendDestinationValue",
            "BendMiddleOffset1",
            "BendMiddleOffset2",
            "BendDestinationOffset",
            "BendMiddleValue",
            "Element",
            "Variation",
            "Tone",
            "Octave",
            "Tapped",
            "LeftHandTapped",
            "ShowStringNumber",
            "Midi" ] } } } },
  select:{ $data:"0/attrs/name" },
  selectCases:{ HopoOrigin:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    HopoDestination:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    Muted:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    PalmMuted:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    Bended:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    Tapped:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    LeftHandTapped:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    ShowStringNumber:{ $ref:"/gpif/props#/definitions/BooleanProperty" },
    BendOriginValue:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    BendOriginOffset:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    BendMiddleValue:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    BendMiddleOffset1:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    BendMiddleOffset2:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    BendDestinationValue:{ $ref:"/gpif/props#/definitions/FloatProperty" },
    Fret:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        fret:{ type:"string",
          typecast:{ type:"integer" } } } },
    String:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        string:{ type:"string",
          typecast:{ type:"integer" } } } },
    HarmonicType:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        htype:{ type:"string",
          "enum":[ "natural",
            "pinch",
            "artificial",
            "tap",
            "semi",
            "feedback" ] } } },
    HarmonicFret:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        hfret:{ type:"string",
          typecast:{ type:"float" } } } },
    Slide:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        flags:{ type:"string",
          typecast:{ type:"integer" } } } },
    Element:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        element:{ type:"string" } } },
    Variation:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        variation:{ type:"string" } } },
    Tone:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        step:{ type:"string" } } },
    Octave:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        number:{ type:"string",
          typecast:{ type:"integer" } } } },
    Midi:{ additionalProperties:false,
      properties:{ node:{},
        attrs:{},
        number:{ type:"string",
          typecast:{ type:"integer" } } } } } };
data$1.$id;
data$1.type;
data$1.properties;
data$1.select;
data$1.selectCases;

var data = { $id:"/gpif/rhythm",
  type:"object",
  additionalProperties:false,
  properties:{ node:{ constant:"rhythm" },
    attrs:{ type:"object",
      additionalProperties:false,
      properties:{ id:{ type:"string" } } },
    notevalue:{ type:"string",
      "enum":[ "whole",
        "half",
        "quarter",
        "eighth",
        "16th",
        "32nd",
        "64th",
        "128th" ] },
    primarytuplet:{ $ref:"#/definitions/PrimaryTuplet" },
    augmentationdot:{ $ref:"#/definitions/AugmentationDot" } },
  definitions:{ AugmentationDot:{ additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ count:{ type:"string",
              typecast:{ type:"integer" } } } } } },
    PrimaryTuplet:{ additionalProperties:false,
      properties:{ attrs:{ type:"object",
          additionalProperties:false,
          properties:{ num:{ type:"string",
              typecast:{ type:"integer" } },
            den:{ type:"string",
              typecast:{ type:"integer" } } } } } } } };
data.$id;
data.type;
data.additionalProperties;
data.properties;
data.definitions;

require('ajv');
var itemsCountKeyword = {
    type: 'array',
    errors: false,
    validate: function (count, data) {
        return data.length === count;
    }
};

require('ajv');
const NUMBERS_STRING_PATTERN = /^([0-9e\-\.]+)|(-?1\.\#(ind|qnan|snan|inf))?$/;
var numbersStringKeyword = {
    type: 'string',
    errors: false,
    validate: function (enabled, data) {
        if (!enabled || data == '') {
            return true;
        }
        return NUMBERS_STRING_PATTERN.test(data);
    }
};

const Ajv$1 = require('ajv');
var Types;
(function (Types) {
    Types["Number"] = "number";
    Types["Float"] = "float";
    Types["Integer"] = "integer";
    Types["Boolean"] = "boolean";
})(Types || (Types = {}));
var typecastKeyword = {
    type: 'string',
    errors: true,
    validate: function (schema, data, parentSchema, dataPath) {
        try {
            switch (schema.type) {
                case Types.Number:
                case Types.Float:
                case Types.Integer:
                    return validateAsNumber(schema, data);
                case Types.Boolean:
                    return validateAsBoolean(schema, data);
                default:
                    throw {
                        keyword: 'type',
                        message: `Unknown type ${schema.type}`
                    };
            }
        }
        catch (e) {
            const { keyword, message } = e;
            throw new Ajv$1.ValidationError({
                message,
                keyword: `typecast.${keyword}`,
                dataPath,
                data
            });
        }
        return false;
    }
};
function validateAsNumber(schema, data) {
    const value = +data;
    if (parseFloat(data) !== value) {
        throw { keyword: 'type', message: `Not a number` };
    }
    if (schema.type == Types.Integer) {
        if (Number.isInteger(value) == false)
            throw { keyword: 'type', message: `Not an integer` };
    }
    if (schema.minimum) {
        if (value < schema.minimum)
            throw { keyword: 'minimum', message: `Must be bigger than ${schema.minimum}` };
    }
    if (schema.maximum) {
        if (value > schema.maximum)
            throw { keyword: 'maximum', message: `Must be less than ${schema.maximum}` };
    }
    if (schema.range) {
        if (value < schema.range[0] || value > schema.range[1])
            throw { keyword: 'range', message: `Must be between ${schema.range[0]} and ${schema.range[1]}` };
    }
    return true;
}
function validateAsBoolean(schema, data) {
    if (data !== 'true' && data !== 'false') {
        return false;
    }
    return true;
}

const Ajv = require('ajv');
const ajv = new Ajv({
    v5: true,
    allErrors: true,
    verbose: true,
    $data: true
});
require('ajv-keywords')(ajv, 'select');
const schemas = [
    data$i,
    data$h,
    data$g,
    data$f,
    data$d,
    data$e,
    data$c,
    data$b,
    data$a,
    data$9,
    data$7,
    data$8,
    data$6,
    data$4,
    data$5,
    data$3,
    data$2,
    data$1,
    data
];
ajv.addSchema(schemas);
ajv.addKeyword('itemsCount', itemsCountKeyword);
ajv.addKeyword('numbersString', numbersStringKeyword);
ajv.addKeyword('typecast', typecastKeyword);

function validate(schemaName, data) {
    const validator = ajv.getSchema(schemaName);
    if (!validator) {
        throw new Error(`Schema ${schemaName} couldn't be found`);
    }
    const isValid = Boolean(validator(data));
    if (!isValid) {
        throw validator.errors;
    }
    return isValid;
}

cli.command('parse', 'Guitar Pro 6 file parsing').alias('p')
    .argument('<source-file>', 'Guitar Pro file (gpx)')
    .option('-t, --target-file <target-file>', 'Target file')
    .option('-e, --env <env>', 'Enviroment')
    .option('-v, --validate <validate>', 'Validate')
    .option('-d, --display-results <display-results>', 'Display results')
    .action(function (args, options, logger) {
    logger.info(`parse ${args.sourceFile}:`);
    if (options.env) {
        process.env[options.env] = options.env;
    }
    return loadBinary(args.sourceFile)
        .then(blob => parseGpx(blob))
        .then(parsedData => {
        logger.info(`${args.sourceFile} has been parsed`, options);
        if (options.validate) {
            logger.info('validate');
            try {
                validate('/gpx-root', parsedData);
            }
            catch (errors) {
                logger.error('Errors', errors);
            }
            logger.info('validated');
        }
        if (options.displayResults) {
            logger.info(parsedData);
        }
        if (options.targetFile) {
            saveToFile(`${options.targetFile}.json`, parsedData.gpif, true);
            saveToFile(`${options.targetFile}.xml`, parsedData.xml.gpif);
        }
    })
        .catch(e => logger.error(e));
});

cli.command('bulk-check', 'Guitar Pro 6 files bulk check').alias('bc')
    .argument('<source-dir>', 'Source directory')
    .option('-e, --env <env>', 'Enviroment')
    .option('-ff, --from-file <from-file>', 'Start from file')
    .option('-le, --errors-file <errors-file>', 'Error Details')
    .option('--log-file <log-file>', 'Result log file')
    .action(function (args, options, logger) {
    logger.info(`parse ${args.sourceDir}:`);
    if (options.env) {
        process.env[options.env] = options.env;
    }
    let isStarted = options.fromFile
        ? false : true;
    const files = walkSync(args.sourceDir)
        .filter((filePath) => {
        if (/\.gpx$/.test(filePath) == false)
            return false;
        if (options.fromFile && !isStarted) {
            return isStarted = path__default["default"].basename(filePath) === options.fromFile;
        }
        return true;
    });
    return Promise.all(files.map(filePath => {
        return loadBinary(filePath)
            .then(blob => parseGpx(blob))
            .then(parsedData => (validate('/gpx-root', parsedData), parsedData))
            .then(parsedData => logCheckResult(true, filePath, options.logFile, parsedData))
            .catch(e => {
            logCheckResult(false, filePath, options.logFile, e);
            if (options.errorsFile) {
                logError(filePath, options.errorsFile, e);
            }
        });
    }));
});

let maxItems = 10;
cli.command('collect-enums', 'Collect values').alias('ce')
    .argument('<source-dir>', 'Source directory')
    .option('--log-file <log-file>', 'Result log file')
    .option('--state-file <state-file>', 'File with a previous result')
    .option('--from-file <from-file>', 'From file number')
    .option('--max-items <max-items>', 'Max values to collect for an each field')
    .option('--max-files <max-files>', 'Max source files count')
    .action(function (args, options, logger) {
    logger.info(`collect ${args.sourceDir}:`);
    let summary = {
        lastId: 0
    };
    if (options.stateFile) {
        summary = loadFile(options.stateFile, true);
    }
    if (options.maxItems) {
        maxItems = +options.maxItems;
    }
    if (options.env) {
        process.env[options.env] = options.env;
    }
    let files = walkSync(args.sourceDir)
        .filter((filePath) => {
        return /\.gpx$/.test(filePath);
    });
    if (options.fromFile > 0) {
        files = files.slice(+options.fromFile || 0);
    }
    if (files.length > options.maxFiles) {
        files = files.slice(0, options.maxFiles);
    }
    return Promise.all(files.map((filePath, i) => {
        const index = (+options.fromFile || 0) + i;
        return loadBinary(filePath)
            .then(blob => parseGpx(blob))
            .then(parsedData => {
            summary = collect(summary, parsedData);
            summary.lastId = index;
            console.log(filePath, index, index % 10);
            if (index % 10 == 0 || index + 1 == files.length) {
                saveToFile(options.logFile, summary, true);
            }
        });
    }));
});
function collect(summ, obj, path = 'root') {
    switch (true) {
        case obj instanceof Array:
            obj.forEach(child => {
                const propName = child && child.attrs && (child.attrs.name);
                const propLabel = propName
                    ? `(${propName})`
                    : '';
                return collect(summ, child, `${path}.${child.node}${propLabel}`);
            });
            break;
        case typeof obj == 'object':
            Object.keys(obj).forEach(key => collect(summ, obj[key], `${path}.${key}`));
            break;
        default:
            if (summ[path] === undefined) {
                summ[path] = [];
            }
            else if (summ[path].length >= maxItems) {
                summ[path].shift();
            }
            if (!summ[path].includes(obj)) {
                if (typeof obj == 'string' && obj.length > 20) {
                    break;
                }
                summ[path].push(obj);
            }
    }
    return summ;
}

cli.version('1.0.0').parse(process.argv);
