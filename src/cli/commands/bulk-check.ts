import path from 'path';
import cli from '../cli';
import { loadBinary, logCheckResult, walkSync, logError } from '../helpers';
import { parseGpx } from '../../main';
import { validate } from '../../validation/validator';

export default cli.command('bulk-check', 'Guitar Pro 6 files bulk check').alias('bc')
    .argument('<source-dir>', 'Source directory')
    .option('-e, --env <env>', 'Enviroment')
    .option('-ff, --from-file <from-file>', 'Start from file')
    .option('-le, --errors-file <errors-file>', 'Error Details')
    .option('--log-file <log-file>', 'Result log file')
    .action(function (args, options, logger) {
        logger.info(`parse ${args.sourceDir}:`);

        if (options.env) {
            process.env[options.env] = options.env;
        }

        ///

        let isStarted = options.fromFile 
            ? false : true;
        
        const files = walkSync(args.sourceDir)
            .filter((filePath) => {
                if (/\.gpx$/.test(filePath) == false)
                    return false;

                if (options.fromFile && !isStarted) {
                    return isStarted = path.basename(filePath) === options.fromFile;
                }

                return true;
            });
        
        return Promise.all(files.map(filePath => {
            return loadBinary(filePath)
                .then(blob => parseGpx(blob))
                .then(parsedData => (validate('/gpx-root', parsedData), parsedData))
                .then(parsedData => logCheckResult(true, filePath, options.logFile, parsedData))
                .catch(e => {
                    logCheckResult(false, filePath, options.logFile, e);

                    if (options.errorsFile) {
                        logError(filePath, options.errorsFile, e);
                    }
                });
        }));
    });