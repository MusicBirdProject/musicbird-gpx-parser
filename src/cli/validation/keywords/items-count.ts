const Ajv = require('ajv');

export default {
    type: 'array',
    errors: false,
    validate: function(count, data: Array<any>): boolean {
        return data.length === count;
    }
}
