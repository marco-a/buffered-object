#!/bin/sh

rm -rf ./es5

mkdir ./es5

babel src/BufferedObject.js -o es5/BufferedObject.js
babel src/example.js -o es5/example.js
babel src/RingBuffer.js -o es5/RingBuffer.js
babel src/Helper.js -o es5/Helper.js