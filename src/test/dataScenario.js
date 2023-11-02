import { createHash } from "../utils/utils.js";

const testUserPassword = 'test';
const testUser = {
    firstName: 'Test',
    lastName: 'Test',
    email: 'test@flowery.com',
    birthDate: '1990-09-09T00:00:00.000Z',
    password: createHash(testUserPassword),
    role: 'user'
};

const newUserPassword = 'new';
const newUser = {
    firstName: 'New',
    lastName: 'User',
    email: 'new@flowery.com',
    birthDate: '1990-09-09T00:00:00.000Z',
    password: createHash(newUserPassword),
    role: 'user'
};

const testProduct = {
    title: 'Test Product',
    description: 'Test Product Description',
    code: 'TESTPRODUCTCODE',
    price: 10,
    stock: 10,
    category: 'Test Category'
};

const newProduct = {
    title: 'New Product',
    description: 'New Product Description',
    code: 'NEWPRODUCTCODE',
    price: 10,
    stock: 10,
    category: 'New Category',
    image: './src/public/img/sources/github-mark.png'
};

export { testUser, newUser, testUserPassword, testProduct, newProduct };
