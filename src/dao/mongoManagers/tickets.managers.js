import TicketsModel from "../models/tickets.model.js";
import EnumErrors from '../../utils/errorHandler/enum.js';
import FloweryCustomError from '../../utils/errorHandler/FloweryCustomError.js';
class TicketMongoManager {
    constructor() {
        this.ticketsModel = TicketsModel;
    }

    createTicket = async (newFields) => {
        try {
            const newTicket = await this.ticketsModel.create(newFields);
            return newTicket;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'createTicket Error',
                message: `Failed to add ticket: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });            
        }
    }

    getTicketByCode = async (ticketCode) => {
        try {
            const ticket = await this.ticketsModel.findOne({ code: ticketCode });
            return ticket;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'getTicketByCode Error',
                message: `Failed to retrieve ticket: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

}

export default TicketMongoManager;