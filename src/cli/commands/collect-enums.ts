import cli from '../cli';
import { loadBinary, saveToFile, walkSync, loadFile } from '../helpers';
import { parseGpx } from '../../main';

let maxItems = 10;

export default cli.command('collect-enums', 'Collect values').alias('ce')
    .argument('<source-dir>', 'Source directory')
    .option('--log-file <log-file>', 'Result log file')
    .option('--state-file <state-file>', 'File with a previous result')
    .option('--from-file <from-file>', 'From file number')
    .option('--max-items <max-items>', 'Max values to collect for an each field')
    .option('--max-files <max-files>', 'Max source files count')
    .action(function (args, options, logger) {
        logger.info(`collect ${args.sourceDir}:`);

        let summary = {
            lastId: 0
        };

        if (options.stateFile) {
            summary = loadFile(options.stateFile, true);
        }

        if (options.maxItems) {
            maxItems = +options.maxItems;
        }

        ///

        let files = walkSync(args.sourceDir)
            .filter((filePath) => {
                return /\.gpx$/.test(filePath);
            });

        if (options.fromFile > 0) {
            files = files.slice(+options.fromFile || 0);
        }

        if (files.length > options.maxFiles) {
            files = files.slice(0, options.maxFiles);
        }

        return Promise.all(files.map((filePath, i) => {
            const index = (+options.fromFile || 0) + i;

            return loadBinary(filePath)
                .then(blob => parseGpx(blob))
                .then(parsedData => {
                    summary = collect(summary, parsedData);
                    summary.lastId = index;

                    console.log(filePath, index, index % 10);

                    if (index % 10 == 0 || index + 1 == files.length) {
                        saveToFile(options.logFile, summary, true);
                    }
                });
        }));
    });

///

function collect(summ, obj, path = 'root') {
    let newValue;

    switch (true) {
        case obj instanceof Array:
            obj.forEach(child => {
                const propName = child && child.attrs && (child.attrs.name);
                const propLabel = propName
                    ? `(${propName})`
                    : '';

                return collect(summ, child, `${path}.${child.node}${propLabel}`);
            });
            break;

        case typeof obj == 'object':
            Object.keys(obj).forEach(key => collect(summ, obj[key], `${path}.${key}`));
            break;

        default:
            if (summ[path] === undefined) {
                summ[path] = [];
            } else if (summ[path].length >= maxItems) {
                summ[path].shift();
            }

            if (!summ[path].includes(obj)) {
                if (typeof obj == 'string' && obj.length > 20) {
                    break;
                }

                summ[path].push(obj);
            }
    }

    return summ;
}