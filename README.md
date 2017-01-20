# BufferedObject.js
A small class to enable buffering WebSocket (or similar) packets!

## What is this?

Say you receive a WebSocket packet each second and now you want to buffer some data.
For example the temperature of a CPU.

To accomplish this painlessly I have created this little helper library.

With `BufferedObject` you will be able to buffer any data without altering your interface logic.

Instead of manually buffer each property `BufferedObject` will automatically buffer the specified properties:

```js
let bufferMe = {
	/*
	 * This is needed so the buffer can be cleared on the fly.
	 * The buffer will be automatically cleared when the value of
	 * `myDataID` changes.
	 */
	'myDataID': 10,

	/*
	 * Create a property called `cpuTemperatue` for me with the size of `100`.
	 * Clear the buffer on `myDataID` value change.
	 */
	'cpuTemperature[100]@myDataID': 33
}

// For an example check src/example.js out!
```
