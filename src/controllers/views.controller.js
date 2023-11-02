import { ProductService } from '../services/products.services.js';
import { UserService } from '../services/users.services.js';

import CartMongoManager from '../dao/mongoManagers/carts.manager.js';

const register = async (req, res) => {
    res.render('register', {title: 'Welcome new Flowerier!!', style: 'login.css'});
}

const login = async (req, res) => {
    res.render('login', {title: 'Hello Flowerier!!', style: 'login.css'});
}

const resetPasswordRequest = async (req, res) => {
    res.render('resetPasswordRequest', {title: 'Hello Flowerier!! Lets recover your password', style: 'login.css'});
}

const resetPassword = async (req, res) => {
    res.render('resetPassword', {title: 'Hello Flowerier!! Lets recover your password', email: req.email, token: req.token, style: 'login.css'});
}

const userProfile = async (req, res) => {
    res.render('userProfile', {title: 'Flowerier profile', style: 'login.css', user: req.user});
}

const staticProducts = async (req, res) => {
    const productsServices = new ProductService();
    const products = await productsServices.getProducts(100);
    res.render('home', {title: 'Flowery 4107 Products', style: 'product.css', products: products});
}

const realTimeProducts = async (req, res) => {
    res.render('realTimeProducts', {title: 'Flowery 4107 Products', style: 'productList.css'});
}

const webchat = async (req, res) => {
    res.render('chat', { style: 'chat.css', title: 'Flowery 4107 Webchat', user: req.user});
}

const products = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category, available } = req.query;
        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const productsServices = new ProductService();
        const products = await productsServices.getProducts(limit, page, sort, category, available, baseUrl);
        res.render('productList', {title: 'Flowery 4107 Products', style: 'productList.css', products: products, user: req.user});
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const carts = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cartManager = new CartMongoManager();
        const cart = await cartManager.getCartById(cartId);
        res.render('cart', {title: 'Flowery 4107 Cart', style: 'cart.css', cart: cart});
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const users = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const usersServices = new UserService();
        const users = await usersServices.getUsers(limit, page, baseUrl);
        res.render('userList', {title: 'Flowery 4107 Users', style: 'userList.css', users: users, user: req.user});
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export default {
    register,
    login,
    resetPasswordRequest,
    resetPassword,
    userProfile,
    staticProducts,
    realTimeProducts,
    webchat,
    products,
    carts,
    users
};