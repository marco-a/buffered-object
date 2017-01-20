#!/bin/sh

rm -rf ./es5

mkdir ./es5

./node_modules/.bin/babel src/BufferedObject.js -o es5/BufferedObject.js
./node_modules/.bin/babel src/example.js -o es5/example.js