# MusicBird - GPX Parser

Converts .gpx tablature file into a json tree

## Installation
```
yarn add @musicbird/gpx-parser
``` 
or
```
npm install @musicbird/gpx-parser
```

## Usage
```ts
import { parseGpx, GPXRoot } from '@musicbird/gpx-parser';

const jBinary = require('jbinary');
const commonTypes = {
    'jBinary.littleEndian': true
};

const parsedData: GPXRoot = await jBinary.load(file, commonTypes)
    .then(binary => binary.read('blob'))
    .then(blob => parseGpx(blob));
```
