export default class MessagesRepository {

    constructor(dao) {
        this.dao = dao;
    }

    getMessages = async () => {
        const messages = await this.dao.getMessages();
        return messages;
    }

    addMessage = async (user, message) => {
        const newMessage = await this.dao.addMessage(user, message);
        return newMessage;
    }

}

