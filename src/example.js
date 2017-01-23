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