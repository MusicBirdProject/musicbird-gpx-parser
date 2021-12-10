const Ajv = require('ajv');

enum Types {
    Number = 'number',
    Float = 'float',
    Integer = 'integer',
    Boolean = 'boolean'
}

export default {
    type: 'string',
    errors: true,
    validate: function(schema, data: string, parentSchema, dataPath): boolean {
        let value;
        
        try {
            switch(schema.type) {
                case Types.Number:
                case Types.Float:
                case Types.Integer:
                    return validateAsNumber(schema, data);
                    
                case Types.Boolean:
                    return validateAsBoolean(schema, data);
                    
                default:
                    throw { 
                        keyword: 'type', 
                        message: `Unknown type ${schema.type}` 
                    }
            }
        } catch(e) {
            const {keyword, message} = e;
            
            throw new Ajv.ValidationError({ 
                message, 
                keyword: `typecast.${keyword}`, 
                dataPath,
                data 
            });
        }
        
        return false;
    }
}

///

function validateAsNumber(schema, data: string) {
    const value = +data;
    
    if (parseFloat(data) !== value) {
        throw { keyword: 'type', message: `Not a number` };
    }
    
    if (schema.type == Types.Integer) {
        if (Number.isInteger(value) == false) 
            throw { keyword: 'type', message: `Not an integer` };
    }
    
    ///
    
    if (schema.minimum) {
        if (value < schema.minimum) 
            throw { keyword: 'minimum', message: `Must be bigger than ${schema.minimum}` };
    }
    
    if (schema.maximum) {
        if (value > schema.maximum) 
            throw { keyword: 'maximum', message: `Must be less than ${schema.maximum}` };
    }
    
    if (schema.range) {
        if (value < schema.range[0] || value > schema.range[1]) 
            throw { keyword: 'range', message: `Must be between ${schema.range[0]} and ${schema.range[1]}` };
    }
  
    return true;
}

function validateAsBoolean(schema, data: string) {
    if (data !== 'true' && data !== 'false') {
        return false;
    }
  
    return true;
}
