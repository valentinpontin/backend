import chai from 'chai';
import supertest from 'supertest';
import configureCommander from '../config/commander.config.js';
import configureDotenv from '../config/dotenv.config.js';
import configureMongo from '../config/mongoDB.config.js';
import mongoose from 'mongoose';
import UserMongoManager from '../dao/mongoManagers/users.managers.js';
import ProductMongoManager from '../dao/mongoManagers/products.manager.js';
import CartMongoManager from '../dao/mongoManagers/carts.manager.js';
import { testUser, testUserPassword, testProduct, newProduct } from './dataScenario.js';

const env = configureCommander();
configureDotenv(env);

const expect = chai.expect;

const host = `${process.env.APP_URL}`;
const requester = supertest(host);

const userMongoManager = new UserMongoManager();
const productMongoManager = new ProductMongoManager();
const cartMongoManager = new CartMongoManager();

let testProductId;
let testCartId
let newCartId;

const prepareScenario = async () => {
    try {
        const user = await userMongoManager.createUser(testUser);
        const product = await productMongoManager.addProduct(testProduct);
        const cart = await cartMongoManager.createCart();
        testProductId = product._id.toString();
        testCartId = cart._id.toString();
    } catch (error) {
        console.log('error preparing scenario');
    }
};

const destroyScenario = async () => {
    try {
        await productMongoManager.deleteProduct(testProductId);
        await userMongoManager.deleteUserByEmail(testUser.email);
        await cartMongoManager.deleteCart(newCartId);
    } catch (error) {
        console.log('error deleting scenario');
    }
};

describe('Test api/carts endpoints', () => {
    let session;
    let sessionAdmin;

    before('Before all scripts', async function () {
        this.timeout(10000);
        await configureMongo();
        await prepareScenario();
        let loginResponse;
        loginResponse = await requester
            .post('/api/sessions/login')
            .send({ email: testUser.email, password: testUserPassword })
        session = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
        loginResponse = await requester
            .post('/api/sessions/login')
            .send({ email: process.env.ADMIN_USER, password: process.env.ADMIN_PASSWORD })
        sessionAdmin = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    describe('Create Cart', () => {

        it('POST Should create a cart', async () => {
            const { statusCode, ok, body } = await requester
                .post('/api/carts')
                .set('Cookie', `floweryjwt=${session}`)
                .send();
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(201);
            expect(body.status).to.equal(1);
            expect(body.msg).to.equal('Cart added successfully');
            expect(body).to.have.property('cartId');
            expect(body.cartId).to.be.a('string');
            newCartId = body.cartId;
        });

    });

    describe('Add Product to Cart', () => {

        it('POST Should add a product to a cart', async () => {
            const { statusCode, ok, body } = await requester
                .post(`/api/carts/${testCartId}/products/${testProductId}`)
                .set('Cookie', `floweryjwt=${session}`)
                .send();
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(201);
            expect(body.status).to.equal(1);
            expect(body.msg).to.equal('Product added to cart successfully');
            expect(body).to.have.property('cart');
            expect(body.cart).to.be.an('object');
            expect(body.cart).to.have.property('products');
            expect(body.cart.products).to.be.an('array');
            expect(body.cart.products[0]).to.be.an('object');
            expect(body.cart.products[0]).to.have.property('product');
            expect(body.cart.products[0].product).to.be.an('object');
            expect(body.cart.products[0].product).to.have.property('title');
            expect(body.cart.products[0].product.title).to.equal(testProduct.title);
            expect(body.cart.products[0].product).to.have.property('description');
            expect(body.cart.products[0].product.description).to.equal(testProduct.description);
            expect(body.cart.products[0].product).to.have.property('code');
            expect(body.cart.products[0].product.code).to.equal(testProduct.code);
            expect(body.cart.products[0].product).to.have.property('price');
            expect(body.cart.products[0].product.price).to.equal(testProduct.price);
            expect(body.cart.products[0].product).to.have.property('stock');
            expect(body.cart.products[0].product.stock).to.equal(testProduct.stock);
            expect(body.cart.products[0].product).to.have.property('category');
            expect(body.cart.products[0].product.category).to.equal(testProduct.category);
        });

        it('POST Should not add a product to a cart if the product is not found', async () => {
            const { statusCode, ok, body } = await requester
                .post(`/api/carts/${testCartId}/products/6498f2feb8c8060f32debf0e`)
                .set('Cookie', `floweryjwt=${session}`)
                .send();
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Product not found');
        });

    });

    describe('Empty Cart', () => {

        it('DELETE Should empty a cart', async () => {
            const { statusCode, ok, body } = await requester
                .delete(`/api/carts/${testCartId}`)
                .set('Cookie', `floweryjwt=${session}`)
                .send();
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.msg).to.equal('Cart successfully emptied');
            expect(body).to.have.property('cart');
            expect(body.cart).to.be.an('object');
            expect(body.cart).to.have.property('products');
            expect(body.cart.products).to.be.an('array');
            expect(body.cart.products).to.be.empty;
        });

        it('DELETE Should not empty a cart if the cart is not found', async () => {
            const { statusCode, ok, body } = await requester
                .delete(`/api/carts/6498f2feb8c8060f32debf0e`)
                .set('Cookie', `floweryjwt=${session}`)
                .send();
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Cart not found');
        });

    });

    after('After all scripts', async () => {
        await destroyScenario();
        mongoose.disconnect();
    });

});