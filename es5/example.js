'use strict';

var _BufferedObject = require('./BufferedObject.js');

var _BufferedObject2 = _interopRequireDefault(_BufferedObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonPrettyPrint = function jsonPrettyPrint(json) {
  console.log(JSON.stringify(json, null, 4));
};

var CPUTemperaturePacketDataID = 1;

var CPUTemperaturePacket = function CPUTemperaturePacket(value) {
  return {
    system: {
      cpus: [{
        'tempID': CPUTemperaturePacketDataID,
        '^temperature[5]@tempID': value
      }]
    }
  };
};

// Create buffered object instance
var BufferedCPUTemp = new _BufferedObject2.default();

// Push our first value
jsonPrettyPrint(BufferedCPUTemp.update(CPUTemperaturePacket(33)));
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
BufferedCPUTemp.update(CPUTemperaturePacket(44));

// Push value 55
BufferedCPUTemp.update(CPUTemperaturePacket(55));

// Push value 66
jsonPrettyPrint(BufferedCPUTemp.update(CPUTemperaturePacket(66)));

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
CPUTemperaturePacketDataID++;

jsonPrettyPrint(BufferedCPUTemp.update(CPUTemperaturePacket(77)));

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
});

// If the property disppears then the internal buffer will be deleted
jsonPrettyPrint(BufferedCPUTemp.update({}));
