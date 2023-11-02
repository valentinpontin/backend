import { ProductService } from '../services/products.services.js';
import { MessageService } from '../services/messages.services.js';

const productsUpdated = async (io) => {
    const productsServices = new ProductService();
    const products = await productsServices.getProducts(100);
    io.emit('productsUpdated', products.products);  
};

const chat = async (socket, io) => {
    socket.on('authenticated', async (data) => {
        const messagesService = new MessageService();
        const messages = await messagesService.getMessages();
        socket.emit('messageLogs', messages); 
        socket.broadcast.emit('newUserConnected', data); 
    });

    socket.on('message', async (data) => {
        const { user, message } = data;
        const messagesService = new MessageService();
        const newMessage = await messagesService.addMessage(user.email, message);
        const messages = await messagesService.getMessages();
        io.emit('messageLogs', messages); 
    });
};

export { productsUpdated , chat };