import BufferedObject from './BufferedObject.js'

/**
 * DataHolder to be used with the buffered object.
 */
let DataHolder = function(size) {
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

let exampleStructure = {
	'dataID'            : 1337,
	'cpuTemp[10]@dataID': 33
}

let bufferedObject = new BufferedObject(exampleStructure, DataHolder)

/*
 Will return

 {
 	cpuTemp: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 33 ]
 }
*/
console.log(bufferedObject.get().cpuTemp)

/*
 Will return

 {
 	cpuTemp: [ 0, 0, 0, 0, 0, 0, 0, 0, 99, 33 ]
 }
*/
exampleStructure['cpuTemp[10]@dataID'] = 99
console.log(bufferedObject.update(exampleStructure).cpuTemp)

/*
 Now we change the data ID
 This will reset all data.
 */
exampleStructure['dataID'] = 1338
exampleStructure['cpuTemp[10]@dataID'] = 1337
console.log(bufferedObject.update(exampleStructure).cpuTemp)