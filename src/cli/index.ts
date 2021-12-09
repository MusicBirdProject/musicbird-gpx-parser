import cli from './cli';
import './commands/parse';
import './commands/bulk-check';
import './commands/collect-enums';

///

cli.version('1.0.0').parse(process.argv);
