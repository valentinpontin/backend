import { faker } from '@faker-js/faker';

const mockingProducts = async () => {
    try {
        const products = [];
        for (let i = 0; i < 100; i++) {
            const product = {
                _id: faker.database.mongodbObjectId(),
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                code: faker.string.alpha({ length: 8, alphaNumeric: true, casing: 'upper' }),
                price: faker.commerce.price(),
                status: faker.datatype.boolean(),
                stock: faker.number.int({ min: 0, max: 100 }),
                category: faker.commerce.department(),
                thumbnails: [...Array(faker.number.int({ min: 1, max: 3 })).keys()].map(() => faker.image.url())
            };
            products.push(product);
        }
        return products;
    } catch (error) {
        throw error;
    }
};

export {
    mockingProducts
};

