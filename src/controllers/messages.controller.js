import { MessageService } from "../services/messages.services.js";;

const messageService = new MessageService();

const getMessages = async (req, res, next) => {
    try {
        const messages = await messageService.getMessages();
        res.send({status: 1, messages: messages});
    } catch (error) {
        next(error);
    }
};

const postMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const newMessage = await messageService.addMessage(req.user.email, message);
        res.send({status: 1, msg: 'Message added successfully', message: newMessage});
    } catch (error) {
        next(error);
    }
};

export default { getMessages, postMessage };