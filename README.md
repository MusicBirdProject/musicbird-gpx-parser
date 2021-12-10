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
import fs from 'fs';
import { parseGpx, GPXRoot } from '@musicbird/gpx-parser';

const gpxFile = fs.readFileSync(file);
const parsedData: GPXRoot = parseGpx(gpxFile);

```

## Contributing
### CLI
#### Prepare

For using cli commands you need to:
- Clone the repo
- Build a cli bundle if it's not ```npm run build:cli```
- Use ```bin/cli [command]``` to run a cli command

#### Commands
- **parse** Parses Guitar Pro 6 file
```
    argument: <source-file> // Guitar Pro file (gpx)
    option: -t, --target-file <target-file> // Target file
    option: -v, --validate <validate> // Validate
```

- **bulk-check** Validates a collection of gpx files and collect found errors
```
    argument: <source-dir> // Source directory:
    option: -ff, --from-file <from-file> // Start from a file
    option: -le, --errors-file <errors-file> // Errors Details
    option: -lf, --log-file <log-file> // Results file
```

- **collect-enums** Walks through a collection of gpx files and collects possible fields and values
```
    argument: <source-dir> // 'Source directory
    option: --log-file <log-file> // Result log file
    option: --state-file <state-file> // State file (contains current state of a collection progress)
    option: --from-file <from-file> // Start from an nth file
    option: --max-items <max-items> // Max values to collect for an each field
    option: --max-files <max-files> // Max source files count
```
