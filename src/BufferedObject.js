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
export default (function(undefined) {
	'use strict'

	let debug = false

	let Helper = {
		warn: function(msg) {
			if (debug !== true) {
				return
			}

			if (`warn` in console) {
				console.warn(`[BufferedObject] WARNING: ${msg}`)
			} else if (`log` in console) {
				console.log(`[BufferedObject] WARNING: ${msg}`)
			}
		},

		copyObject: function(obj) {
			return JSON.parse(JSON.stringify(obj))
		},

		isDigit: function(char) {
			let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

			for (let digit of digits) {
				if (char === `${digit}`) return true
			}

			return false
		},

		isArray: function(v) {
			return Object.prototype.toString.call(v) === `[object Array]`
		},

		isObject: function(v) {
			return Object.prototype.toString.call(v) === `[object Object]`
		},

		isPrimitive: function(v) {
			return !Helper.isArray(v) && !Helper.isObject(v)
		},

		isString: function(v) {
			return typeof(v) === `string`
		},

		strReplace: function(str, src, replace) {
			return str.split(src).join(replace)
		},

		strContains: function(str, contains) {
			return str.indexOf(contains) >= 0
		}
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
	 *	extractChunksFromName('prop[100]@id')
	 *	{
	 *		propName: 'prop',
	 *		dataSize: 100,
	 *		dataID: 'id'
	 *	}

	 *	extractChunksFromName('@@abc@@[100]@@@[]@@id')
	 *	{
	 *		propName: '@@abc@@',
	 *		dataSize: 100,
	 *		dataID: '@@[]@@id'
	 *	}
	 *
	 */
	let extractChunksFromName = (name) => {
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
							throw new Error(`Unexpected character "${char}", expected a digit instead!`)
						} else {
							dataSize += char
						}
					}
				} break

				case DATAID_WAIT: {
					if (char !== `@`) {
						throw new Error(`Unexpected character "${char}, expected "@" instead.`)
					} else {
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

	let traverseObject = (target, callback) => {
		if (!Helper.isObject(target)) {
			throw new Error(`target must be an object!`)
		}

		let traverse = (target, parent = '', data) => {
			if (Helper.isArray(target)) {
				for (let len = target.length, i = 0; i < len; ++i) {
					let value = target[i]

					parent += `[${i}]`

					traverse(value, parent, {
						key: i,
						parent: target
					})
				}
			} else if (Helper.isObject(target)) {
				for (let key in target) {
					if (!target.hasOwnProperty(key)) continue
					let value = target[key]

					let escapedKey = Helper.strReplace(key, `'`, `\\'`)

					parent += `['${escapedKey}']`

					traverse(value, parent, {
						key: escapedKey,
						parent: target
					})
				}
			} else {
				callback(parent, data.key, data.parent)
			}
		}

		traverse(target)
	}

	let getAllBufferedProperties = (obj) => {
		let props = []

		traverseObject(obj, (path, key, parent) => {
			let chunks = extractChunksFromName(key)

			if (chunks !== false) {
				props.push({
					path: path,
					chunks: chunks
				})
			}
		})

		return props
	}

	/**
	 * BufferedObject class.
	 *
	 * Example
	 *
	 *	let exampleStructure = {
	 *		'dataID'             : 1337,
	 *		'cpuTemp[100]@dataID': 100
	 *	}
	 *
	 *	let example = new BufferedObject(exampleStrucutre, DataContainer)
	 *
	 *	// Get the transformed object:
	 *	let transformedExample = example.get()
	 *
	 *	// This will return:
	 *	{
	 *		cpuTemp: [DataContainer().get()]
	 *	}
	 *
	 *	// Update with the same value
	 *	// This will call [Instance of DataContainer].insert(theValue)
	 *	// Also this will return the updated data structure
	 *	example.update(exampleStructure)
	 */
	let BufferedObject = function(obj, DataContainer) {
		let bufferedProperties = getAllBufferedProperties(obj)
		let buffers = {}
		let numProps = bufferedProperties.length

		/*
		 * Receive all properties that need to be buffered.
		 */
		for (let bufferedProperty of bufferedProperties) {
			buffers[bufferedProperty.path] = {
				dataID: undefined,
				obj: undefined
			}
		}

		/*
		 * Returns all informations for a given path.
		 */
		let _getChunksByPath = (path) => {
			for (let bufferedProperty of bufferedProperties) {
				if (bufferedProperty.path === path) {
					return bufferedProperty.chunks
				}
			}

			return false
		}

		let _updateOrGet = (obj, insert = true) => {
			/** Work on a copy **/
			obj = Helper.copyObject(obj)

			let validProperties = 0

			traverseObject(obj, (path, key, parent) => {
				let chunks = _getChunksByPath(path)

				if (chunks !== false) {
					if (!Helper.isObject(parent)) {
						throw new Error(`Unknown error`)
					} else if (!parent.hasOwnProperty(chunks.dataID)) {
						throw new Error(`Data ID property "${chunks.dataID}" is missing for "${path}"!`)
					} else if (parent.hasOwnProperty(chunks.propName)) {
						throw new Error(`Buffered property "${chunks.propName}" already exists!`)
					} else if (!(path in buffers)) {
						throw new Error(`An unknown error occurred!`)
					} else {
						let buffer      = buffers[path]
						let newDataID   = parent[chunks.dataID]
						let newValue    = parent[key]

						// Data ID value changed
						if (buffer.dataID !== newDataID) {
							//Helper.warn(`Data ID value changed! <${buffer.dataID} != ${newDataID}>`)

							buffer.obj = undefined
						}

						if (buffer.obj === undefined) {
							buffer.obj = new DataContainer(chunks.dataSize)

							buffer.obj.insert(newValue)
						} else if (insert === true) {
							buffer.obj.insert(newValue)
						}

						parent[chunks.propName] = buffer.obj.get()

						buffer.dataID = newDataID

						++validProperties
					}

					// Delete data property
					delete parent[key]
					// Delete data ID property
					delete parent[chunks.dataID]
				}
			})

			if (validProperties !== numProps) {
				Helper.warn(`Some properties are missing. <${validProperties} != ${numProps}>`)
			}

			return obj
		}

		this.get = () => {
			return _updateOrGet(obj, false)
		}

		this.update = (obj) => {
			return _updateOrGet(obj, true)
		}

		this.toString = () => {
			return `[BufferedObject<${numProps}>]`
		}

		_updateOrGet(obj, true)
	}

	// Return the buffered object
	return BufferedObject
})()
