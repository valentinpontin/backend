export default class FloweryCustomError {
    static createError({name = 'Error', recievedParams, message, type = 1, statusCode = 400}){
        const error = new Error(message);
        error.name = name;
        error.type = type;
        error.recievedParams = recievedParams;
        error.statusCode = statusCode;
        throw error;
    }
}
