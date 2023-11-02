import EnumErrors from "./enum.js";
import { floweryLogger } from "../logger.js";
import e from "connect-flash";

export default (error, req, res, next) => {
    let errorObject;
    if (error.type) {
            const validErrorTypes = Object.values(EnumErrors).map(enumError => enumError.type);
            if (validErrorTypes.includes(error.type)) {
                errorObject = {
                    type: error.type,
                    name: error.name,
                    message: error.message,
                    recievedParams: error.recievedParams
                    }
                const errorType = Object.values(EnumErrors).find(enumError => enumError.type === error.type);
                if (errorType.logLevel) floweryLogger(errorType.logLevel, JSON.stringify(errorObject));

                return res.status(error.statusCode || 400).send({
                    status: 0,
                    errorObject: errorObject
                });
            }
        }
 
    errorObject = {
        type: 999,
        name: 'Unhandled Internal Server Error',
        message: error.message
        }
    floweryLogger('fatal', JSON.stringify(errorObject));
    res.status(error.statusCode || 500).send({
        status: 0,
        errorObject: errorObject
        });
};