export default class UsersRepository {

    constructor(dao) {
        this.dao = dao;
    }

    getUsers = async (limit = 10, page = 1) => {
        const users = await this.dao.getUsers(limit, page);
        return users;
    }

    getUserByEmail = async (email) => {
        const user = await this.dao.getUserByEmail(email);
        return user;
    }

    updateUser = async (userId, updatedFields) => {
        const updatedUser = await this.dao.updateUser(userId, updatedFields);
        return updatedUser;
    }

    createUser = async (user) => {
        const newUser = await this.dao.createUser(user);
        return newUser;
    }

    deleteUserByEmail = async (email) => {
        const deletedUser = await this.dao.deleteUserByEmail(email);
        return deletedUser;
    }

    deleteInactiveUsers = async () => {
        const deletedUsers = await this.dao.deleteInactiveUsers();
        return deletedUsers;
    }
    
}

