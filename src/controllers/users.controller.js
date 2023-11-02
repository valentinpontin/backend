import { UserService } from "../services/users.services.js";

const userService = new UserService();

const getUsers = async (req, res, next) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const users = await userService.getUsers(limit, page, baseUrl);
        res.send({ status: 1, ...users });
    } catch (error) {
        next(error);
    }
};

const getUserByEmail = async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await userService.getUserByEmail(email);
        res.send({ status: 1, msg: 'User successfully retrieved.', user });
    } catch (error) {
        next(error);
    }
}

const togglePremiumFeature = async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await userService.togglePremiumFeature(email);
        res.send({ status: 1, msg: `Premium feature for flowerier ${user.email} successfully toggled. New role is ${user.role}` });
    } catch (error) {
        next(error);
    }
};

const updateDocuments = async (req, res, next) => {
    try {
        const email = req.params.email;
        const documents = req.files;
        const user = await userService.updateDocuments(email, documents);
        res.send({ status: 1, msg: `Documents for flowerier ${user.email} successfully updated.`, userDocuments: user.documents });
    } catch (error) {
        next(error);
    }
}

const deleteInactiveUsers = async (req, res, next) => {
    try {
        const users = await userService.deleteInactiveUsers();
        res.send({ status: 1, msg: 'Inactive users successfully deleted.', users });
    } catch (error) {
        next(error);
    }
}

export default {
    getUsers,
    getUserByEmail,
    togglePremiumFeature,
    updateDocuments,
    deleteInactiveUsers
};