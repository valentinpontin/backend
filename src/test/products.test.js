import chai from 'chai';
import supertest from 'supertest';
import configureCommander from '../config/commander.config.js';
import configureDotenv from '../config/dotenv.config.js';
import configureMongo from '../config/mongoDB.config.js';
import mongoose from 'mongoose';
import UserMongoManager from '../dao/mongoManagers/users.managers.js';
import ProductMongoManager from '../dao/mongoManagers/products.manager.js';
import { testUser, testUserPassword, testProduct, newProduct } from './dataScenario.js';

const env = configureCommander();
configureDotenv(env);

const expect = chai.expect;

const host = `${process.env.APP_URL}`;
const requester = supertest(host);

const userMongoManager = new UserMongoManager();
const productMongoManager = new ProductMongoManager();
let testProductId;
let newProductId;

const prepareScenario = async () => {
    try {
        const user = await userMongoManager.createUser(testUser);
        const product = await productMongoManager.addProduct(testProduct);
        testProductId = product._id.toString();
    } catch (error) {
        console.log('error preparing scenario');
    }
};

const destroyScenario = async () => {
    try {
        await productMongoManager.deleteProduct(testProductId);
    }
    catch (error) {
        console.log('error destroying scenario');
    }
    try {
        await productMongoManager.deleteProduct(newProductId);
        await userMongoManager.deleteUserByEmail(testUser.email);
    } catch (error) {
        console.log('error deleting scenario');
    }
};

describe('Test api/products endpoints', () => {
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

    describe('Get All Products', () => {

        it('GET Should get all products', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products').set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.products).to.be.a('array');
            expect(body.products.length).to.be.greaterThan(0);
            expect(body.products[0]).to.be.a('object');
            expect(body.products[0]).to.have.property('_id');
            expect(body.products[0]._id).to.be.a('string');
            expect(body.products[0]).to.have.property('title');
            expect(body.products[0].title).to.be.a('string');
            expect(body.products[0]).to.have.property('description');
            expect(body.products[0].description).to.be.a('string');
            expect(body.products[0]).to.have.property('code');
            expect(body.products[0].code).to.be.a('string');
            expect(body.products[0]).to.have.property('price');
            expect(body.products[0].price).to.be.a('number');
            expect(body.products[0]).to.have.property('stock');
            expect(body.products[0].stock).to.be.a('number');
            expect(body.products[0]).to.have.property('category');
            expect(body.products[0].category).to.be.a('string');
            expect(body).to.have.property('totalProducts');
            expect(body.totalProducts).to.be.a('number');
            expect(body).to.have.property('limit');
            expect(body.limit).to.be.a('number');
            expect(body).to.have.property('totalPages');
            expect(body.totalPages).to.be.a('number');
        });
        it('GET Should get all products with limits', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products?limit=1').set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.products).to.be.a('array');
            expect(body.products.length).to.equal(1);
            expect(body.products[0]).to.be.a('object');
            expect(body.products[0]).to.have.property('_id');
            expect(body.products[0]._id).to.be.a('string');
            expect(body.products[0]).to.have.property('title');
            expect(body.products[0].title).to.be.a('string');
            expect(body.products[0]).to.have.property('description');
            expect(body.products[0].description).to.be.a('string');
            expect(body.products[0]).to.have.property('code');
            expect(body.products[0].code).to.be.a('string');
            expect(body.products[0]).to.have.property('price');
            expect(body.products[0].price).to.be.a('number');
            expect(body.products[0]).to.have.property('stock');
            expect(body.products[0].stock).to.be.a('number');
            expect(body.products[0]).to.have.property('category');
            expect(body.products[0].category).to.be.a('string');
            expect(body).to.have.property('limit');
            expect(body.limit).to.be.a('number');
            expect(body.limit).to.equal(1);
        });

        it('GET Should get all products with category filter', async () => {
            const { statusCode, ok, body } = await requester.get(`/api/products?category=${testProduct.category}`).set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.products).to.be.a('array');
            expect(body.products.length).to.equal(1);
            expect(body.products[0]).to.be.a('object');
            expect(body.products[0]).to.have.property('_id');
            expect(body.products[0]._id).to.be.a('string');
            expect(body.products[0]).to.have.property('title');
            expect(body.products[0].title).to.be.a('string');
            expect(body.products[0]).to.have.property('description');
            expect(body.products[0].description).to.be.a('string');
            expect(body.products[0]).to.have.property('code');
            expect(body.products[0].code).to.be.a('string');
            expect(body.products[0]).to.have.property('price');
            expect(body.products[0].price).to.be.a('number');
            expect(body.products[0]).to.have.property('stock');
            expect(body.products[0].stock).to.be.a('number');
            expect(body.products[0]).to.have.property('category');
            expect(body.products[0].category).to.be.a('string');
            expect(body.products[0].category).to.equal('Test Category');
            expect(body.products[0].title).to.equal(testProduct.title);
            expect(body.products[0].description).to.equal(testProduct.description);
            expect(body.products[0].code).to.equal(testProduct.code);
            expect(body.products[0].price).to.equal(testProduct.price);
            expect(body.products[0].stock).to.equal(testProduct.stock);
            expect(body.products[0].category).to.equal(testProduct.category);
        });

        it('GET Should not get all products with invalid sort value', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products?sort=invalid').set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(400);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Invalid sort value. asc or desc expected');
        });

    });

    describe('Get Product by ID', () => {

        it('GET Should get product by id', async () => {
            const { statusCode, ok, body } = await requester.get(`/api/products/${testProductId}`).set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.product).to.be.a('object');
            expect(body.product).to.have.property('_id');
            expect(body.product._id).to.be.a('string');
            expect(body.product).to.have.property('title');
            expect(body.product.title).to.be.a('string');
            expect(body.product).to.have.property('description');
            expect(body.product.description).to.be.a('string');
            expect(body.product).to.have.property('code');
            expect(body.product.code).to.be.a('string');
            expect(body.product).to.have.property('price');
            expect(body.product.price).to.be.a('number');
            expect(body.product).to.have.property('stock');
            expect(body.product.stock).to.be.a('number');
            expect(body.product).to.have.property('category');
            expect(body.product.category).to.be.a('string');
            expect(body.product._id).to.equal(testProductId);
            expect(body.product.title).to.equal(testProduct.title);
            expect(body.product.description).to.equal(testProduct.description);
            expect(body.product.code).to.equal(testProduct.code);
            expect(body.product.price).to.equal(testProduct.price);
            expect(body.product.stock).to.equal(testProduct.stock);
            expect(body.product.category).to.equal(testProduct.category);
        });

        it('GET Should not get product by not existant id', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products/6498f2feb8c8060f32debf0e').set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Product not found');
        });

        it('GET Should not get product by invalid id', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products/invalid').set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(500);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.include('Cast to ObjectId failed for value');
        });


    });

    describe('Create Product', () => {

        it('POST Should create product', async () => {
            const { statusCode, ok, body } = await requester.post('/api/products').set('Cookie', [`floweryjwt=${sessionAdmin}`])
                .field('title', newProduct.title)
                .field('description', newProduct.description)
                .field('code', newProduct.code)
                .field('price', newProduct.price)
                .field('stock', newProduct.stock)
                .field('category', newProduct.category)
                .attach('thumbnails', newProduct.image);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.product).to.be.a('object');
            expect(body.product).to.have.property('_id');
            expect(body.product._id).to.be.a('string');
            expect(body.product).to.have.property('title');
            expect(body.product.title).to.be.a('string');
            expect(body.product).to.have.property('description');
            expect(body.product.description).to.be.a('string');
            expect(body.product).to.have.property('code');
            expect(body.product.code).to.be.a('string');
            expect(body.product).to.have.property('price');
            expect(body.product.price).to.be.a('number');
            expect(body.product).to.have.property('stock');
            expect(body.product.stock).to.be.a('number');
            expect(body.product).to.have.property('category');
            expect(body.product.category).to.be.a('string');
            expect(body.product.title).to.equal('New Product');
            expect(body.product.description).to.equal('New Product Description');
            expect(body.product.code).to.equal('NEWPRODUCTCODE');
            expect(body.product.price).to.equal(10);
            expect(body.product.stock).to.equal(10);
            expect(body.product.category).to.equal('New Category');
            newProductId = body.product._id.toString();
        });
        it('POST Should not create product with duplicated code', async () => {
            const { statusCode, ok, body } = await requester.post('/api/products').set('Cookie', [`floweryjwt=${sessionAdmin}`])
                .field('description', newProduct.description)
                .field('code', testProduct.code)
                .field('price', newProduct.price)
                .field('stock', newProduct.stock)
                .field('category', newProduct.category)
                .attach('thumbnails', newProduct.image);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(400);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Product with same code already exists');
        });
    });

    describe('Update Product', () => {

        it('PUT Should update product', async () => {
            const { statusCode, ok, body } = await requester.put(`/api/products/${testProductId}`).set('Cookie', [`floweryjwt=${sessionAdmin}`])
                .send({
                    price: 20,
                });
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.product).to.be.a('object');
            expect(body.product).to.have.property('_id');
            expect(body.product._id).to.be.a('string');
            expect(body.product).to.have.property('title');
            expect(body.product.title).to.be.a('string');
            expect(body.product).to.have.property('description');
            expect(body.product.description).to.be.a('string');
            expect(body.product).to.have.property('code');
            expect(body.product.code).to.be.a('string');
            expect(body.product).to.have.property('price');
            expect(body.product.price).to.be.a('number');
            expect(body.product).to.have.property('stock');
            expect(body.product.stock).to.be.a('number');
            expect(body.product).to.have.property('category');
            expect(body.product.category).to.be.a('string');
            expect(body.product._id).to.equal(testProductId);
            expect(body.product.price).to.equal(20);
        });

        it('PUT Should not update product with invalid id', async () => {
            const { statusCode, ok, body } = await requester.put('/api/products/invalid').set('Cookie', [`floweryjwt=${sessionAdmin}`])
                .send({
                    price: 20,
                });
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(500);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.include('Cast to ObjectId failed for value');
        });

        it('PUT Should not update product with not existant id', async () => {
            const { statusCode, ok, body } = await requester.put('/api/products/6498f2feb8c8060f32debf0e').set('Cookie', [`floweryjwt=${sessionAdmin}`])
                .send({
                    price: 20,
                });
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Product not found');
        });

        it('PUT Should not update product with negative price', async () => {
            const { statusCode, ok, body } = await requester.put(`/api/products/${testProductId}`).set('Cookie', [`floweryjwt=${sessionAdmin}`])
                .send({
                    price: -20,
                });
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(400);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Invalid price value. Positive number expected');
        });

    });

    describe('Delete Product', () => {

        it('DELETE Should delete product', async () => {
            const { statusCode, ok, body } = await requester.delete(`/api/products/${testProductId}`).set('Cookie', [`floweryjwt=${sessionAdmin}`]);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
        });

        it('DELETE Should not delete product with invalid id', async () => {
            const { statusCode, ok, body } = await requester.delete('/api/products/invalid').set('Cookie', [`floweryjwt=${sessionAdmin}`]);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(500);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.include('Cast to ObjectId failed for value');
        });

        it('DELETE Should not delete product with not existant id', async () => {
            const { statusCode, ok, body } = await requester.delete('/api/products/6498f2feb8c8060f32debf0e').set('Cookie', [`floweryjwt=${sessionAdmin}`]);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal(0);
            expect(body.errorObject.message).to.equal('Product not found');
        });

        it('DELETE Should not delete product with not admin user', async () => {
            const { statusCode, ok, body } = await requester.delete(`/api/products/${newProductId}`).set('Cookie', [`floweryjwt=${session}`]);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(403);
            expect(body.status).to.equal(0);
            expect(body.msg).to.equal('Forbidden');
        });

    });

    after('After all scripts', async () => {
        await destroyScenario();
        mongoose.disconnect();
    });

});