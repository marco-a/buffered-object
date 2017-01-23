'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

/*
	MIT License

	Copyright (c) 2017 Marco

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
exports.default = function () {
	var debug = true;

	var Helper = {
		error: function error(msg) {
			throw new Error('[BufferedObject] ' + msg);
		},

		warn: function warn(msg) {
			if (debug !== true) {
				return;
			}

			if ('warn' in console) {
				console.warn('[BufferedObject] ' + msg);
			} else if ('log' in console) {
				console.log('[BufferedObject] WARNING: ' + msg);
			}
		},

		copyObject: function copyObject(obj) {
			return JSON.parse(JSON.stringify(obj));
		},

		isDigit: function isDigit(char) {
			var digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = digits[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var digit = _step.value;

					if (char === '' + digit) return true;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return false;
		},

		isArray: function isArray(v) {
			return Helper.getType(v) === 'array';
		},

		isObject: function isObject(v) {
			return Helper.getType(v) === 'object';
		},

		isString: function isString(v) {
			return Helper.getType(v) === 'string';
		},

		isNumber: function isNumber(v) {
			return Helper.getType(v) === 'number';
		},

		isBoolean: function isBoolean(v) {
			return Helper.getType(v) === 'boolean';
		},

		isPrimitive: function isPrimitive(v) {
			return !Helper.isArray(v) && !Helper.isObject(v);
		},

		isFunction: function isFunction(v) {
			return Helper.getType(v) === 'function';
		},

		hasKey: function hasKey(o, k) {
			return k in o;
		},

		getType: function getType(v) {
			var type = Object.prototype.toString.call(v);

			type = type.substr('[object '.length);

			type = type.substr(0, type.length - 1);

			return type.toLowerCase();
		},

		strReplace: function strReplace(str, src, replace) {
			return str.split(src).join(replace);
		},

		strContains: function strContains(str, contains) {
			return str.indexOf(contains) >= 0;
		},

		fetchUntilChar: function fetchUntilChar(str, char) {
			var ret = '';

			for (var i = 0, len = str.length; i < len; ++i) {
				var ch = str[i];

				if (ch === char) {
					return ret;
				} else {
					ret += ch;
				}
			}

			return false;
		}
	};

	return Helper;
}();
