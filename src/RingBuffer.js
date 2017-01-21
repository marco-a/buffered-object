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

/**
 * RingBuffer container to be used with BufferedObject.
 */
import Helper from './Helper.js'

export default function(size, initialValue) {
	let array    = []
	let index    = 0

	initialValue = initialValue || 0

	if (!Helper.isNumber(size) || size <= 0) {
		Helper.error(`Invalid value for RingBuffer size! size = ${size}`)
	}

	for (let i = 0; i < size; ++i) {
		array[i] = initialValue
	}

	/**
	 * Inserts a new value.
	 */
	this.insert = (value) => {
		array[array.length - index - 1] = value

		if (++index >= array.length) {
			index = 0
		}
	}

	/**
	 * Returns the ring buffer as an array.
	 */
	this.get = () => {
		return array.slice(0)
	}

	this.toString = () => {
		return `[RingBuffer<${index + 1} / ${size}>]`
	}
}