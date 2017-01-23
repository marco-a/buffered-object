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
import Helper from './Helper.js'
import RingBuffer from './RingBuffer.js'

export default (function(undefined) {
	'use strict'

	let __debug = (...args) => {
		//console.log(...args)
	}

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
	let parsePropertyName = (name) => {
		let propName = ''
		let dataSize = 0
		let dataID   = ''

		// Possible states
		let PROPNAME    = 0
		let DATASIZE    = 1
		let DATAID_WAIT = 2
		let DATAID      = 3

		let state       = PROPNAME

		for (let len = name.length, i = 0; i < len; ++i) {
			let char = name[i]

			switch (state) {
				/**
				 * First state of this state-machine.
				 * Fetch the name of the property to be
				 * buffered.
				 */
				case PROPNAME: {
					if (char === `[`) {
						state = DATASIZE
					} else {
						propName += char
					}
				} break

				/**
				 * Second state, extract the size of the
				 * data buffer.
				 */
				case DATASIZE: {
					if (char === `]`) {
						state = DATAID_WAIT
					} else {
						if (!Helper.isDigit(char)) {
							Helper.error(`Unexpected character "${char}", expected a digit instead!`)
						} else {
							dataSize += char
						}
					}
				} break

				case DATAID_WAIT: {
					if (char !== `@` && char !== `#`) {
						Helper.error(`Unexpected character "${char}, expected "@" or "#" instead.`)
					} else {
						dataID = char

						state = DATAID
					}
				} break

				/**
				 * And the last state just copies
				 * what's left over into dataID.
				 */
				case DATAID: {
					dataID += char
				} break
			}
		}

		if (state !== DATAID) {
			Helper.error(`Missing informations for "${name}"!`)

			return false
		}

		if (!dataID) {
			return false
		}

		return {
			propName: propName,
			dataSize: parseInt(dataSize, 10),
			dataID  : dataID
		}
	}

	let handleBufferedProperty = (dataContainer, props, root, bufferKey, info, valueToInsert) => {
		// Remove '^'
		info.propName = info.propName.substr(1)

		// -- Extract Data ID
		if (info.dataID[0] === '@') {
			let dataIDProp = info.dataID.substr(1)

			if (!Helper.hasKey(root, dataIDProp)) {
				Helper.error(`Data ID property "${dataIDProp}" is missing!`)
			}

			info.dataID = root[dataIDProp]

			// Delete data id
			delete root[dataIDProp]
		} else {
			info.dataID = info.dataID.substr(1)
		}

		if (!Helper.isPrimitive(info.dataID)) {
			Helper.error(`Data ID value must be either a string or number!`)
		}
		// -- Extract Data ID

		if (Helper.hasKey(root, info.propName)) {
			Helper.error(`Desired property name "${info.propName}" is already taken!`)
		}

		let buffer      = null
		let needsReinit = false

		if (Helper.hasKey(props, bufferKey)) {
			buffer = props[bufferKey]

			let prevDataID   = buffer.dataID
			let prevDataSize = buffer.dataSize

			if (prevDataID != info.dataID) {
				__debug(`${bufferKey}: data id change <${prevDataID} != ${info.dataID}>!`)

				needsReinit = true
			} else if (prevDataSize != info.dataSize) {
				__debug(`${bufferKey}: data size change <${prevDataSize} != ${info.dataSize}!`)

				needsReinit = true
			} else {
				__debug(`${bufferKey}: update`)
			}
		} else {
			needsReinit = true
		}

		if (needsReinit) {
			__debug(`${bufferKey}: init`)

			if (buffer !== null) {
				__debug(`${bufferKey}: delete`)

				buffer.container = null

				delete buffer.container
			}

			let initialValue = null

			switch (Helper.getType(valueToInsert)) {
				case `string`:
					initialValue = ``
				break

				case `number`:
					initialValue = 0
				break

				case `object`:
					initialValue = {}
				break

				case `array`:
					initialValue = []
				break
			}

			buffer = {
				container: new dataContainer(info.dataSize, initialValue)
			}
		}

		buffer.container.insert(valueToInsert)

		// -- update buffer 
		buffer.dataID       = info.dataID
		buffer.dataSize     = info.dataSize
		buffer.updated      = true

		props[bufferKey]    = buffer

		root[info.propName] = buffer.container.get()
	}

	let BufferedObject = function(dataContainer, opts) {
		this.bufferedProperties = {}

		if (dataContainer === undefined) {
			dataContainer = RingBuffer
		}

		let traverse = (value, parentKeyPath, parent) => {
			let isRootCall = parent === undefined

			if (parentKeyPath === undefined) {
				parentKeyPath = ``
			}

			if (Helper.isObject(value)) {
				for (let key in value) {
					if (!value.hasOwnProperty(key)) continue

					let escapedKey = Helper.strReplace(key, `'`, `\\'`)
					let keyPath    = `${parentKeyPath}['${escapedKey}']`

					if (escapedKey[0] === '^') {
						let bufferInfo = parsePropertyName(key)

						if (bufferInfo !== false) {
							let bufferKey = `${parentKeyPath}['${bufferInfo.propName}']`
							let newValue  = value[key]

							// -- delete property
							delete value[key]

							handleBufferedProperty(dataContainer, this.bufferedProperties, value, bufferKey, bufferInfo, newValue)
						}
					} else {
						traverse(value[key], keyPath, value)
					}
				}
			} else if (Helper.isArray(value)) {
				let length = value.length

				for (let i = 0; i < length; ++i) {
					let keyPath = `${parentKeyPath}[${i}]`

					traverse(value[i], keyPath, value)
				}
			}

			if (isRootCall) {
				return value
			}
		}

		this.numBufferedProps = () => {
			let num = 0

			for (let key in this.bufferedProperties) {
				if (!this.bufferedProperties.hasOwnProperty(key)) continue

				++num
			}

			return num
		}

		this.toString = () => {
			return `[BufferedObject <${this.numBufferedProps()}>]`
		}

		this.update = (obj) => {
			if (!Helper.isObject(obj)) {
				Helper.error(`Invalid value!`)
			}

			for (let prop in this.bufferedProperties) {
				this.bufferedProperties[prop].updated = false
			}

			let ret = traverse(Helper.copyObject(obj))

			for (let prop in this.bufferedProperties) {
				if (!this.bufferedProperties[prop].updated) {
					__debug(`Deleting ${prop}`)

					this.bufferedProperties[prop].container = null

					delete this.bufferedProperties[prop]
				}
			}

			ret.toString = () => {
				return '[BufferedObject]'
			}

			return ret
		}

	}

	// Return class
	return BufferedObject
})()
