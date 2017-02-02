*Deprecated in favor of [object-buffer](https://npmjs.com/object-buffer)*

---

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

let jsonPrettyPrint = (json) => {
	console.log(JSON.stringify(json, null, 4))
}

let CPUTemperaturePacketDataID = 1

let CPUTemperaturePacket = (value) => {
	return {
		system: {
			cpus: [{
				'tempID': CPUTemperaturePacketDataID,
				'^temperature[5]@tempID': value
			}]
		}
	}
}

// Create buffered object instance
let BufferedCPUTemp = new BufferedObject;

// Push our first value
jsonPrettyPrint(BufferedCPUTemp.update(CPUTemperaturePacket(33)))
/*
 This will return:

 {
 	"system": {
 		"cpus": [
 			{
 				"temperature": [
 					0,
 					0,
 					0,
 					0,
 					33 <-- our first value is here
 				]
 			}
 		]
 	}
 }
*/

// Push value 44
BufferedCPUTemp.update(CPUTemperaturePacket(44))

// Push value 55
BufferedCPUTemp.update(CPUTemperaturePacket(55))

// Push value 66
jsonPrettyPrint(BufferedCPUTemp.update(CPUTemperaturePacket(66)))

/*
 This will return:

 {
 	"system": {
 		"cpus": [
 			{
 				"temperature": [
 					0,
 					66,
 					55,
 					44,
 					33 <-- our first value is here
 				]
 			}
 		]
 	}
 }
*/


// Push value 77 and clear history
CPUTemperaturePacketDataID++

jsonPrettyPrint(BufferedCPUTemp.update(CPUTemperaturePacket(77)))

/*
 This will return:

 {
 	"system": {
 		"cpus": [
 			{
 				"temperature": [
 					0,
 					0,
 					0,
 					0,
 					77 <-- our first value is here
 				]
 			}
 		]
 	}
 }
*/

// It is also possible to directly assign a data id with #
BufferedCPUTemp.update({
	system: {
		cpus: [{
			'^temperature[5]#2': 99
		}]
	}
})

// If the property disppears then the internal buffer will be deleted
jsonPrettyPrint(BufferedCPUTemp.update({}))
```

## Can I use this in the browser?

Yes, just use [browserify](http://npmjs.com/browserify) or [webpack](http://npmjs.com/webpack).
