export default (function() {
	let debug = true

	let Helper = {
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
			return Object.prototype.toString.call(v) === `[object Array]`
		},

		isObject: (v) => {
			return Object.prototype.toString.call(v) === `[object Object]`
		},

		isString: (v) => {
			return Object.prototype.toString.call(v) === `[object String]`
		},

		isNumber: (v) => {
			return Object.prototype.toString.call(v) === `[object Number]`
		},

		isBoolean: (v) => {
			return Object.prototype.toString.call(v) === `[object Number]`
		},

		isPrimitive: (v) => {
			return !Helper.isArray(v) && !Helper.isObject(v)
		},

		getType: (v) => {
			return Object.prototype.toString.call(v)
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