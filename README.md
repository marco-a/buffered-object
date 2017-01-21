# buffered-object
A small class to enable buffering WebSocket (or similar) packets!

## What is this?

Say you receive a WebSocket packet each second and now you want to buffer some data.

For example the temperature of a CPU.

To accomplish this painlessly I have created this library.

With `BufferedObject` you will be able to buffer any data without altering your existing interface logic.

Instead of manually buffering each property `BufferedObject` will automatically buffer the specified properties:

```js
import BufferedObject from './BufferedObject.js'

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
let buffer = new BufferedObject(bufferMe)

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
console.log(`${bufferNew3}`)
console.log(`${buffer}`)

// This will warn us because
// we always pushed numbers and now
// we are pushing a string
let bufferNew4 = buffer.update({
	'myDataID': 12,
	'cpuTemperature[10]@myDataID': '100'
})
```

It even works with deeply nested properties and arrays!

## Can I use this in the browser?

Yes, just use [browserify](http://npmjs.com/browserify) or [webpack](http://npmjs.com/webpack).
