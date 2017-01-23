'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (size, initialValue) {
	var array = [];
	var index = 0;

	if (!_Helper2.default.isNumber(size) || size <= 0) {
		_Helper2.default.error('Invalid value for RingBuffer size! size = ' + size);
	}

	for (var i = 0; i < size; ++i) {
		array[i] = initialValue;
	}

	/**
  * Inserts a new value.
  */
	this.insert = function (value) {
		array[array.length - index - 1] = value;

		if (++index >= array.length) {
			index = 0;
		}
	};

	/**
  * Returns the ring buffer as an array.
  */
	this.get = function () {
		return array.slice(0);
	};

	this.toString = function () {
		return '[RingBuffer<' + (index + 1) + ' / ' + size + '>]';
	};
};

var _Helper = require('./Helper.js');

var _Helper2 = _interopRequireDefault(_Helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
