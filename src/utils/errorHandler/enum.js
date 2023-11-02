const EnumErrors = {
    ROUTING_ERROR: {
        type: 1,
        statusCode: 404,
        logLevel: 'error'
    },
    INVALID_TYPES_ERROR: {
        type: 2,
        statusCode: 400,
        logLevel: 'warning'
    },
    INVALID_FIELDS_VALUE_ERROR: {
        type: 3,
        statusCode: 400,
        logLevel: 'warning'
    },
    INVALID_BODY_STRUCTURE_ERROR: {
        type: 4,
        statusCode: 400,
        logLevel: 'warning'
    },
    NOT_FOUND_ENTITY_ID_ERROR: {
        type: 5,
        statusCode: 404,
        logLevel: 'warning'
    },
    UNIQUE_KEY_VIOLATION_ERROR: {
        type: 6,
        statusCode: 400,
        logLevel: 'warning'
    },    
    INVALID_PROGRAM_DATA_ERROR: {
        type: 7,
        statusCode: 500,
        logLevel: 'warning'
    }, 
    BUSSINESS_TRANSACTION_ERROR: {
        type: 8,
        statusCode: 500,
        logLevel: 'error'
    }, 
    BUSSINESS_RULES_ERROR: {
        type: 9,
        statusCode: 400,
        logLevel: 'warning'
    },  
    DATABASE_ERROR: {
        type: 10,
        statusCode: 500,
        logLevel: 'error'
    }
};

export default EnumErrors;
