import BufferedObject from './BufferedObject.js'

/**
 * DataContainer to be used with BufferedObject.
 */
let DataContainer = function(size) {
	console.log(`Initializing dataholder with size of ${size}`)

	let array    = []
	let index    = 0

	for (let i = 0; i < size; ++i) {
		array[i] = 0
	}

	/**
	 * Inserts a value.
	 */
	this.insert = (value) => {
		console.log(`Inserting value ${value}`)

		array[array.length - index - 1] = value

		if (++index >= array.length) {
			index = 0
		}
	}

	/**
	 * Returns the array.
	 */
	this.get = () => {
		return array.slice(0)
	}
}

let bufferMe = {
	/*
	 * This is needed so the buffer can be cleared on the fly.
	 * The buffer will be automatically cleared when the value of
	 * `myDataID` changes.
	 */
	'myDataID': 10,

	/*
	 * Create a property called `cpuTemperatue` for me with the size of `10`.
	 * Clear the buffer on `myDataID` value change.
	 */
	'cpuTemperature[10]@myDataID': 33
}

// Create our BufferedObject instance
let buffer = new BufferedObject(bufferMe, DataContainer)

// We can get our final object with the .get() method:
let bufferNew1 = buffer.get()

/*
 {
    cpuTemperature: [0, 0, 0, 0, 0, 0, 0, 0, 0, 33]
 }
 */
console.log(bufferNew1)

// ... and dynamically insert values with .update():
let bufferNew2 = buffer.update({
    'myDataID': 10,
    'cpuTemperature[10]@myDataID': 99
})

/*
 {
    cpuTemperature: [0, 0, 0, 0, 0, 0, 0, 0, 99, 33]
 }
 */
console.log(bufferNew2)

// If we want to reset our buffer we need to change
// the associated data ID value:
let bufferNew3 = buffer.update({
    'myDataID': 12,
    'cpuTemperature[10]@myDataID': 99
})

/*
 {
    cpuTemperature: [0, 0, 0, 0, 0, 0, 0, 0, 99]
 }
 */
console.log(bufferNew3)

// toString() will return the number of
// buffered properties
// ... or not? (WIP)
console.log(`${bufferNew3}`)