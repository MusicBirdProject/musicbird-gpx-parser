import { ajv } from './index';
import { GPXRoot } from '../../types';

///

export function validate(schemaName: string, data: GPXRoot): boolean {
    const validator = ajv.getSchema(schemaName);

    if (!validator) {
        throw new Error(`Schema ${schemaName} couldn't be found`);
    }

    ///

    const isValid = Boolean(validator(data));

    if (!isValid) {
        throw validator.errors;
        //throw new Error(`${ajv.errorsText(validator.errors)}`);
    }

    return isValid;
}
