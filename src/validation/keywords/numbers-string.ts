const Ajv = require('ajv');
const NUMBERS_STRING_PATTERN = /^([0-9e\-\.]+)|(-?1\.\#(ind|qnan|snan|inf))?$/;

export default {
    type: 'string',
    errors: false,
    validate: function(enabled, data: string): boolean {
        if (!enabled || data == '') {
            return true;
        }
        
        return NUMBERS_STRING_PATTERN.test(data);
    }
}
