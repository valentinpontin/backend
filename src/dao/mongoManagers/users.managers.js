import UsersModel from "../models/users.model.js";
import EnumErrors from '../../utils/errorHandler/enum.js';
import FloweryCustomError from '../../utils/errorHandler/FloweryCustomError.js';

class UserMongoManager {
    constructor() {
        this.usersModel = UsersModel;
    }

    getUsers = async (limit = 10, page = 1) => {
        try {
            let query = this.usersModel.find({ deletedAt: { $exists: false } });

            const users = await this.usersModel.paginate(query, {
                limit: parseInt(limit) || 10,
                lean: true,
                page: parseInt(page) || 1,
                customLabels: {
                    docs: 'users',
                    totalDocs: 'totalUsers',
                }
              });

            return users;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'getUsers Error',
                message: `Failed to retrieve users: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
                });
        }
    }

    getUserByEmail = async (email) => {
        try {
            const user = await this.usersModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            return user;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'getUserByEmail Error',
                message: `Failed to retrieve user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

    updateUser = async (userId, updatedFields) => {
        try {
            const { role, lastConnection, documents } = updatedFields;
            const updatedUser = await this.usersModel.findByIdAndUpdate(userId, {role: role, lastConnection: lastConnection, documents: documents}, {new: true});
            if (!updatedUser) {
                FloweryCustomError.createError({
                  name: 'updateUser Error',
                  message: 'User not found',
                  type: EnumErrors.DATABASE_ERROR.type,
                  statusCode: EnumErrors.DATABASE_ERROR.statusCode
                });        
              }
            return updatedUser;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'updateUser Error',
                message: `Failed to update user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

    createUser = async (user) => {
        try {
            const newUser = await this.usersModel.create(user);
            return newUser;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'createUser Error',
                message: `Failed to create user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });
        }
    }

    deleteUserByEmail = async (email) => {
        try {
            const deletedUser = await this.usersModel.findOneAndDelete({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            return deletedUser;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'deleteUserByEmail Error',
                message: `Failed to delete user: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
              });             
        }
    }

    deleteInactiveUsers = async () => {
        try {
            const inactivityDays = process.env.INACTIVITY_DAYS || 2;

            const inactiveUsersToUpdate = await this.usersModel.find({
                lastConnection: { $lt: new Date(Date.now() - (86400000 * inactivityDays)) },
                deletedAt: { $exists: false },
            });

            const result = await this.usersModel.updateMany(
                { _id: { $in: inactiveUsersToUpdate.map(user => user._id) } },
                { $set: { deletedAt: new Date() } }
            );
    
            return inactiveUsersToUpdate;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'deleteInactiveUsers Error',
                message: `Failed to soft delete inactive users: ${error.message}`,
                type: EnumErrors.DATABASE_ERROR.type,
                statusCode: EnumErrors.DATABASE_ERROR.statusCode
            });
        }
    }
    

}

export default UserMongoManager;