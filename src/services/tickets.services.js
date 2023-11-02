import { ticketsRepository } from '../repositories/index.js';
import shortid from 'shortid';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';

class TicketService {
    constructor() {
        this.ticketsRepository = ticketsRepository;
    }

    ticketFieldsValidation = async (ticket) => {
        try {
            const allowedFields = ['amount', 'purchaser'];
            const receivedFields = Object.keys(ticket);
            const isValidOperation = receivedFields.every((field) => allowedFields.includes(field));
            if (!isValidOperation) {
                FloweryCustomError.createError({
                    name: 'ticketFieldsValidation Error',
                    message: 'Invalid fields',                        
                    type: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.type,
                    recievedParams: { ticket },
                    statusCode: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.statusCode
                });
            }
            ticket.code = shortid.generate();
            const ticketWithSameCode = await this.ticketsRepository.getTicketByCode(ticket.code);
            if (ticketWithSameCode) {
                FloweryCustomError.createError({
                    name: 'ticketFieldsValidation Error',
                    message: 'Ticket with same code already exists',                        
                    type: EnumErrors.UNIQUE_KEY_VIOLATION_ERROR.type,
                    recievedParams: { code: ticket.code },
                    statusCode: EnumErrors.UNIQUE_KEY_VIOLATION_ERROR.statusCode
                });
            }
            if (ticket.amount <= 0) {
                FloweryCustomError.createError({
                    name: 'ticketFieldsValidation Error',
                    message: 'Ticket amount must be greater than 0',                        
                    type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                    recievedParams: { amount: ticket.amount },
                    statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
                });                    
            }
            return ticket;
        } catch (error) {
            throw error;
        }
    };

    createTicket = async (newTicketFields) => {
        try {
            const ticketWithCode = await this.ticketFieldsValidation(newTicketFields);
            const newTicket = await this.ticketsRepository.createTicket(ticketWithCode);
            return newTicket;
        } catch (error) {
            throw error;
        }
    }

}

export { TicketService }