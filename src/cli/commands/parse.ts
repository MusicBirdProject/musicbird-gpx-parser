import cli from '../cli';
import { loadBinary, saveToFile } from '../helpers';
import { validate } from '../validation/validator';
import { parseGpx } from '../../main';

export default cli.command('parse', 'Guitar Pro 6 file parsing').alias('p')
    .argument('<source-file>', 'Guitar Pro file (gpx)')
    .option('-t, --target-file <target-file>', 'Target file')
    .option('-v, --validate <validate>', 'Validate')
    .action(function (args, options, logger) {
        logger.info(`parse ${args.sourceFile}:`);

        ///

        return loadBinary(args.sourceFile)
            .then(blob => parseGpx(blob))
            .then(parsedData => {
                logger.info(`${args.sourceFile} has been parsed`, options);

                if (options.validate) {
                    logger.info('Run validation');
                    try {
                        validate('/gpx-root', parsedData);
                        logger.info('No validation errors found!');
                    } catch (errors) {
                        logger.error('Errors', errors);
                    }
                }

                if (options.targetFile) {
                    saveToFile(`${options.targetFile}.json`, parsedData.gpif, true);
                    saveToFile(`${options.targetFile}.xml`, parsedData.xml.gpif);
                    logger.info(`Saved into ${options.targetFile}`, options);
                } else {
                    logger.info(parsedData.gpif);
                }

            })
            .catch(e => logger.error(e));
    });
