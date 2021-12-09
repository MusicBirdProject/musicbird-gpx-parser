import cli from '../cli';
import { loadBinary, saveToFile } from '../helpers';
import { parseGpx } from '../../main';
import { validate } from '../../validation/validator';

export default cli.command('parse', 'Guitar Pro 6 file parsing').alias('p')
    .argument('<source-file>', 'Guitar Pro file (gpx)')
    .option('-t, --target-file <target-file>', 'Target file')
    .option('-e, --env <env>', 'Enviroment')
    .option('-v, --validate <validate>', 'Validate')
    .option('-d, --display-results <display-results>', 'Display results')
    .action(function (args, options, logger) {
        logger.info(`parse ${args.sourceFile}:`);

        if (options.env) {
            process.env[options.env] = options.env;
        }

        ///

        return loadBinary(args.sourceFile)
            .then(blob => parseGpx(blob))
            .then(parsedData => {
                logger.info(`${args.sourceFile} has been parsed`, options);

                if (options.validate) {
                    logger.info('validate');
                    try {
                        validate('/gpx-root', parsedData);
                    } catch (errors) {
                        logger.error('Errors', errors);
                    }
                    logger.info('validated');
                }

                if (options.displayResults) {
                    logger.info(parsedData)
                }

                if (options.targetFile) {
                    saveToFile(`${options.targetFile}.json`, parsedData.gpif, true);
                    saveToFile(`${options.targetFile}.xml`, parsedData.xml.gpif);
                }

            })
            .catch(e => logger.error(e));
    });
