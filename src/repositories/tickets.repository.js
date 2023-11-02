export default class TicketsRepository {
    
        constructor(dao) {
            this.dao = dao;
        }
    
        createTicket = async (newFields) => {
            const newTicket = await this.dao.createTicket(newFields);
            return newTicket;
        }

        getTicketByCode = async (ticketCode) => {
            const ticket = await this.dao.getTicketByCode(ticketCode);
            return ticket;
        }
    
    }