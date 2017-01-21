/**
 * RingBuffer container to be used with BufferedObject.
 */
import Helper from './Helper.js'

export default function(size, initialValue) {
	let array    = []
	let index    = 0

	initialValue = initialValue || 0

	if (!Helper.isNumber(size) || size <= 0) {
		throw new Error(`Invalid value for RingBuffer size! size = ${size}`)
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