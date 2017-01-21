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
export default (function() {
	let debug = true

	let Helper = {
		error: (msg) => {
			throw new Error(`[BufferedObject] ${msg}`)
		},

		warn: (msg) => {
			if (debug !== true) {
				return
			}

			if (`warn` in console) {
				console.warn(`[BufferedObject] ${msg}`)
			} else if (`log` in console) {
				console.log(`[BufferedObject] WARNING: ${msg}`)
			}
		},

		copyObject: (obj) => {
			return JSON.parse(JSON.stringify(obj))
		},

		isDigit: (char) => {
			let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

			for (let digit of digits) {
				if (char === `${digit}`) return true
			}

			return false
		},

		isArray: (v) => {
			return Helper.getType(v) === `array`
		},

		isObject: (v) => {
			return Helper.getType(v) === `object`
		},

		isString: (v) => {
			return Helper.getType(v) === `string`
		},

		isNumber: (v) => {
			return Helper.getType(v) === `number`
		},

		isBoolean: (v) => {
			return Helper.getType(v) === `boolean`
		},

		isPrimitive: (v) => {
			return !Helper.isArray(v) && !Helper.isObject(v)
		},

		isFunction: (v) => {
			return Helper.getType(v) === `function`
		},

		hasKey: (o, k) => {
			return k in o
		},

		getType: (v) => {
			let type = Object.prototype.toString.call(v)

			type = type.substr(`[object `.length)

			type = type.substr(0, type.length - 1)

			return type
		},

		strReplace: (str, src, replace) => {
			return str.split(src).join(replace)
		},

		strContains: (str, contains) => {
			return str.indexOf(contains) >= 0
		}
	}

	return Helper
})()