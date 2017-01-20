# buffered-object
A small class to enable buffering WebSocket (or similar) packets!

## What is this?

Say you receive a WebSocket packet each second and now you want to buffer some data.

For example the temperature of a CPU.

To accomplish this painlessly I have created this library.

With `BufferedObject` you will be able to buffer any data without altering your existing interface logic.

Instead of manually buffering each property `BufferedObject` will automatically buffer the specified properties:

```js
import BufferedObject from `buffered-object`

let bufferMe = {
	/*
	 * This is needed so the buffer can be cleared on the fly.
	 * The buffer will be automatically cleared when the value of
	 * `myDataID` changes.
	 */
	`myDataID`: 10,

	/*
	 * This will create a property called `cpuTemperatue` with the buffer size of `10`.
	 * Clear the buffer on `myDataID` value change.
	 */
	`cpuTemperature[10]@myDataID`: 33
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
	`myDataID`: 10,
	`cpuTemperature[10]@myDataID`: 99
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
	`myDataID`: 12,
	`cpuTemperature[10]@myDataID`: 99
})

/*
 {
 	cpuTemperature: [0, 0, 0, 0, 0, 0, 0, 0, 99]
 }
 */
console.log(bufferNew3)
```
## Can I use this in the browser?

Yes, just use [browserify](http://npmjs.com/browserify) or [webpack](http://npmjs.com/webpack).

## Why do you not use an options parameter instead?

Because it is inconvenient and not flexible enough.

The class is completely independent with this design.
