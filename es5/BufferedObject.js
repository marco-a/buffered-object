'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Helper = require('./Helper.js');

var _Helper2 = _interopRequireDefault(_Helper);

var _RingBuffer = require('./RingBuffer.js');

var _RingBuffer2 = _interopRequireDefault(_RingBuffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
exports.default = function (undefined) {
	'use strict';

	var __debug = function __debug() {}
	//console.log(...args)


	/**
  * Extracts all needed information from the property name
  * and returns the infos as an object:
  *
  * dataID   => name of the data id property.
  * propName => requested name for buffered property.
  * dataSize => requested size of the buffer.
  *
  * Examples
  *
  *	parsePropertyName('prop[100]@id')
  *	{
  *		propName: 'prop',
  *		dataSize: 100,
  *		dataID: 'id'
  *	}
  *	parsePropertyName('@@abc@@[100]@@@[]@@id')
  *	{
  *		propName: '@@abc@@',
  *		dataSize: 100,
  *		dataID: '@@[]@@id'
  *	}
  *
  */
	;var parsePropertyName = function parsePropertyName(name) {
		var propName = '';
		var dataSize = 0;
		var dataID = '';

		// Possible states
		var PROPNAME = 0;
		var DATASIZE = 1;
		var DATAID_WAIT = 2;
		var DATAID = 3;

		var state = PROPNAME;

		for (var len = name.length, i = 0; i < len; ++i) {
			var char = name[i];

			switch (state) {
				/**
     * First state of this state-machine.
     * Fetch the name of the property to be
     * buffered.
     */
				case PROPNAME:
					{
						if (char === '[') {
							state = DATASIZE;
						} else {
							propName += char;
						}
					}break;

				/**
     * Second state, extract the size of the
     * data buffer.
     */
				case DATASIZE:
					{
						if (char === ']') {
							state = DATAID_WAIT;
						} else {
							if (!_Helper2.default.isDigit(char)) {
								_Helper2.default.error('Unexpected character "' + char + '", expected a digit instead!');
							} else {
								dataSize += char;
							}
						}
					}break;

				case DATAID_WAIT:
					{
						if (char !== '@' && char !== '#') {
							_Helper2.default.error('Unexpected character "' + char + ', expected "@" or "#" instead.');
						} else {
							dataID = char;

							state = DATAID;
						}
					}break;

				/**
     * And the last state just copies
     * what's left over into dataID.
     */
				case DATAID:
					{
						dataID += char;
					}break;
			}
		}

		if (state !== DATAID) {
			_Helper2.default.error('Missing informations for "' + name + '"!');

			return false;
		}

		if (!dataID) {
			return false;
		}

		return {
			propName: propName,
			dataSize: parseInt(dataSize, 10),
			dataID: dataID
		};
	};

	var handleBufferedProperty = function handleBufferedProperty(dataContainer, props, root, bufferKey, info, valueToInsert) {
		// Remove '^'
		info.propName = info.propName.substr(1);

		// -- Extract Data ID
		if (info.dataID[0] === '@') {
			var dataIDProp = info.dataID.substr(1);

			if (!_Helper2.default.hasKey(root, dataIDProp)) {
				_Helper2.default.error('Data ID property "' + dataIDProp + '" is missing!');
			}

			info.dataID = root[dataIDProp];

			// Delete data id
			delete root[dataIDProp];
		} else {
			info.dataID = info.dataID.substr(1);
		}

		if (!_Helper2.default.isPrimitive(info.dataID)) {
			_Helper2.default.error('Data ID value must be either a string or number!');
		}
		// -- Extract Data ID

		if (_Helper2.default.hasKey(root, info.propName)) {
			_Helper2.default.error('Desired property name "' + info.propName + '" is already taken!');
		}

		var buffer = null;
		var needsReinit = false;

		if (_Helper2.default.hasKey(props, bufferKey)) {
			buffer = props[bufferKey];

			var prevDataID = buffer.dataID;
			var prevDataSize = buffer.dataSize;

			if (prevDataID != info.dataID) {
				__debug(bufferKey + ': data id change <' + prevDataID + ' != ' + info.dataID + '>!');

				needsReinit = true;
			} else if (prevDataSize != info.dataSize) {
				__debug(bufferKey + ': data size change <' + prevDataSize + ' != ' + info.dataSize + '!');

				needsReinit = true;
			} else {
				__debug(bufferKey + ': update');
			}
		} else {
			needsReinit = true;
		}

		if (needsReinit) {
			__debug(bufferKey + ': init');

			if (buffer !== null) {
				__debug(bufferKey + ': delete');

				buffer.container = null;

				delete buffer.container;
			}

			var initialValue = null;

			switch (_Helper2.default.getType(valueToInsert)) {
				case 'string':
					initialValue = '';
					break;

				case 'number':
					initialValue = 0;
					break;

				case 'object':
					initialValue = {};
					break;

				case 'array':
					initialValue = [];
					break;
			}

			buffer = {
				container: new dataContainer(info.dataSize, initialValue)
			};
		}

		buffer.container.insert(valueToInsert);

		// -- update buffer 
		buffer.dataID = info.dataID;
		buffer.dataSize = info.dataSize;
		buffer.updated = true;

		props[bufferKey] = buffer;

		root[info.propName] = buffer.container.get();
	};

	var BufferedObject = function BufferedObject(dataContainer, opts) {
		var _this = this;

		this.bufferedProperties = {};

		if (dataContainer === undefined) {
			dataContainer = _RingBuffer2.default;
		}

		var traverse = function traverse(value, parentKeyPath, parent) {
			var isRootCall = parent === undefined;

			if (parentKeyPath === undefined) {
				parentKeyPath = '';
			}

			if (_Helper2.default.isObject(value)) {
				for (var key in value) {
					if (!value.hasOwnProperty(key)) continue;

					var escapedKey = _Helper2.default.strReplace(key, '\'', '\\\'');
					var keyPath = parentKeyPath + '[\'' + escapedKey + '\']';

					if (escapedKey[0] === '^') {
						var bufferInfo = parsePropertyName(key);

						if (bufferInfo !== false) {
							var bufferKey = parentKeyPath + '[\'' + bufferInfo.propName + '\']';
							var newValue = value[key];

							// -- delete property
							delete value[key];

							handleBufferedProperty(dataContainer, _this.bufferedProperties, value, bufferKey, bufferInfo, newValue);
						}
					} else {
						traverse(value[key], keyPath, value);
					}
				}
			} else if (_Helper2.default.isArray(value)) {
				var length = value.length;

				for (var i = 0; i < length; ++i) {
					var _keyPath = parentKeyPath + '[' + i + ']';

					traverse(value[i], _keyPath, value);
				}
			}

			if (isRootCall) {
				return value;
			}
		};

		this.numBufferedProps = function () {
			var num = 0;

			for (var key in _this.bufferedProperties) {
				if (!_this.bufferedProperties.hasOwnProperty(key)) continue;

				++num;
			}

			return num;
		};

		this.toString = function () {
			return '[BufferedObject <' + _this.numBufferedProps() + '>]';
		};

		this.update = function (obj) {
			if (!_Helper2.default.isObject(obj)) {
				_Helper2.default.error('Invalid value!');
			}

			for (var prop in _this.bufferedProperties) {
				_this.bufferedProperties[prop].updated = false;
			}

			var ret = traverse(_Helper2.default.copyObject(obj));

			for (var _prop in _this.bufferedProperties) {
				if (!_this.bufferedProperties[_prop].updated) {
					__debug('Deleting ' + _prop);

					_this.bufferedProperties[_prop].container = null;

					delete _this.bufferedProperties[_prop];
				}
			}

			ret.toString = function () {
				return '[BufferedObject]';
			};

			return ret;
		};
	};

	// Return class
	return BufferedObject;
}();
