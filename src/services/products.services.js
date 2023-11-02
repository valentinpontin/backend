import { productsRepository } from '../repositories/index.js';
import { mockingProducts } from '../utils/mocks.js';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';
import { sendEmail } from '../utils/mailer.js';
class ProductService {
    constructor() {
        this.productRepository = productsRepository;
    }

    getProducts = async (limit = 10, page = 1, sort, category, available, baseUrl) => {
        try {
            if (available) {
                const lowerAvailable = available.toLowerCase();
                if (lowerAvailable !== 'true' && lowerAvailable !== 'false') {
                    FloweryCustomError.createError({
                        name: 'getProducts Error',
                        message: 'Invalid available value. true or false expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        recievedParams: { available },
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if (sort) {
                const lowerSort = sort.toLowerCase();
                if (lowerSort !== 'asc' && lowerSort !== 'desc') {
                    FloweryCustomError.createError({
                        name: 'getProducts Error',
                        message: 'Invalid sort value. asc or desc expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        recievedParams: { sort },
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if (category) {
                const trimmedCategory = category.trim();
                if (trimmedCategory.length === 0) {
                    FloweryCustomError.createError({
                        name: 'getProducts Error',
                        message: 'Invalid category value. Non-empty string expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if (limit) {
                const parsedLimit = parseInt(limit);
                if (isNaN(parsedLimit) || parsedLimit < 1) {
                    FloweryCustomError.createError({
                        name: 'getProducts Error',
                        message: 'Invalid limit value. Positive integer expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        recievedParams: { limit },
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if (page) {
                const parsedPage = parseInt(page);
                if (isNaN(parsedPage) || parsedPage < 1) {
                    FloweryCustomError.createError({
                        name: 'getProducts Error',
                        message: 'Invalid page value. Positive integer expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        recievedParams: { page },
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if (baseUrl) {
                if (typeof baseUrl !== 'string' || baseUrl.length === 0) {
                    FloweryCustomError.createError({
                        name: 'getProducts Error',
                        message: 'Invalid baseUrl value. Non-empty string expected',                        
                        type: EnumErrors.INVALID_PROGRAM_DATA_ERROR.type,
                        recievedParams: { baseUrl },
                        statusCode: EnumErrors.INVALID_PROGRAM_DATA_ERROR.statusCode
                    });
                }
            }

            const products = await this.productRepository.getProducts(limit, page, sort, category, available);

            // Build navigation links
            let navLinks = {};

            if (baseUrl) {
                const sortOptions = ['asc', 'desc'];
                const availableOptions = ['true', 'false'];
                const sortQuery = sort && sortOptions.includes(sort.toLowerCase()) ? `&sort=${sort}` : '';
                const categoryQuery = category ? `&category=${encodeURIComponent(category)}` : '';
                const availableQuery = available && availableOptions.includes(available.toLowerCase()) ? `&available=${available}` : '';
                navLinks = {
                    firstLink: products.totalPages > 1 ? `${baseUrl}?limit=${limit}&page=1${sortQuery}${categoryQuery}${availableQuery}` : null,
                    prevLink: products.hasPrevPage ? `${baseUrl}?limit=${limit}&page=${products.prevPage}${sortQuery}${categoryQuery}${availableQuery}` : null,
                    nextLink: products.hasNextPage ? `${baseUrl}?limit=${limit}&page=${products.nextPage}${sortQuery}${categoryQuery}${availableQuery}` : null,
                    lastLink: products.totalPages > 1 ? `${baseUrl}?limit=${limit}&page=${products.totalPages}${sortQuery}${categoryQuery}${availableQuery}` : null
                };
            }
            const productsWithLinks = { ...products, ...navLinks };
            return productsWithLinks;
        } catch (error) {
            throw error;
        }
    };

    getProductById = async (productId) => {
        try {
            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'getProductById Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            return product;
        } catch (error) {
            throw error;
        }
    };

    productFieldsValidation = async (product, isCreating = false) => {
        try {
            const allowedFields = isCreating ? ['title', 'description', 'code', 'price', 'stock', 'category', 'thumbnails', 'owner'] : 
            ['title', 'description', 'code', 'price', 'stock', 'category', 'thumbnails'];
            const receivedFields = Object.keys(product);
            const isValidOperation = receivedFields.every((field) => allowedFields.includes(field));
            if (!isValidOperation) {
                FloweryCustomError.createError({
                    name: 'productFieldsValidation Error',
                    message: 'Invalid fields',                        
                    type: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.type,
                    recievedParams: { product },
                    statusCode: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.statusCode
                });
            }
            const productWithSameCode = await this.productRepository.getProductByCode(product.code);
            if (productWithSameCode) {
                FloweryCustomError.createError({
                    name: 'productFieldsValidation Error',
                    message: 'Product with same code already exists',                        
                    type: EnumErrors.UNIQUE_KEY_VIOLATION_ERROR.type,
                    recievedParams: { code: product.code },
                    statusCode: EnumErrors.UNIQUE_KEY_VIOLATION_ERROR.statusCode
                });
            }
            if (product.price) {
                const parsedPrice = parseFloat(product.price);
                if (isNaN(parsedPrice) || parsedPrice < 0) {
                    FloweryCustomError.createError({
                        name: 'productFieldsValidation Error',
                        message: 'Invalid price value. Positive number expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        recievedParams: { price: product.price },
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if (product.stock) {
                const parsedStock = parseInt(product.stock);
                if (isNaN(parsedStock) || parsedStock < 0) {
                    FloweryCustomError.createError({
                        name: 'productFieldsValidation Error',
                        message: 'Invalid stock value. Positive integer expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        recievedParams: { stock: product.stock },
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });
                }
            }
            if ('category' in product) {
                const trimmedCategory = product.category.trim();
                if (typeof trimmedCategory !== 'string') {
                    FloweryCustomError.createError({
                        name: 'productFieldsValidation Error',
                        message: 'Invalid category value. String expected',                        
                        type: EnumErrors.INVALID_TYPES_ERROR.type,
                        recievedParams: { category: product.category },
                        statusCode: EnumErrors.INVALID_TYPES_ERROR.statusCode
                    });                    
                }
                if (trimmedCategory.length === 0) {
                    FloweryCustomError.createError({
                        name: 'productFieldsValidation Error',
                        message: 'Invalid category value. Non-empty string expected',                        
                        type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                        statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                    });                    
                }
            }
        } catch (error) {
            throw error;
        }
    };

    addProduct = async (newProductFields) => {
        try {
            await this.productFieldsValidation(newProductFields, true);
            return await this.productRepository.addProduct(newProductFields);
        } catch (error) {
            throw error;
        }
    };

    updateProduct = async (productId, updatedProductFields, user) => {
        try {
            await this.productFieldsValidation(updatedProductFields);
            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'updateProduct Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            if (user.role === 'premium') {
                if (product.owner.toLowerCase() !== user.email.toLowerCase()) {
                    FloweryCustomError.createError({
                        name: 'updateProduct Error',
                        message: 'You are not the owner of this product',                        
                        type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                        recievedParams: { productId },
                        statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                    });
                }
            }
            return await this.productRepository.updateProduct(productId, updatedProductFields);
        } catch (error) {
            throw error;
        }
    };

    deleteProduct = async (productId, user) => {
        try {
            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'deleteProduct Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            if (user.role === 'premium') {
                if (product.owner.toLowerCase() !== user.email.toLowerCase()) {
                    FloweryCustomError.createError({
                        name: 'deleteProduct Error',
                        message: 'You are not the owner of this product',                        
                        type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                        recievedParams: { productId },
                        statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                    });
                }
            }
            if (user.role === 'admin' && product.owner !== 'admin') {
                await sendEmail(product.owner, 'Flowery 4107 - Product deleted', `<h1>Flowery 4107 - Product ${product.code} deleted</h1>
                <p>Your product ${product.title} has been deleted by user ${user.firstName} ${user.lastName}.</p>
                <p>For any concern please contact the user at ${user.email}.</p>${user.firstName}`);
            }
            return await this.productRepository.deleteProduct(productId);
        } catch (error) {
            throw error;
        }
    };

    getProductStock = async (productId) => {
        try {
            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'getProductStock Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            return product.stock;
        } catch (error) {
            throw error;
        }
    };

    updateProductStock = async (productId, quantity) => {
        try {
            if (!quantity ) {
                throw new Error('Invalid quantity');
            }
            const product = await this.productRepository.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'updateProductStock Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });
            }
            const newStock = product.stock + quantity;
            if (newStock < 0) {
                FloweryCustomError.createError({
                    name: 'updateProductStock Error',
                    message: 'Not enough stock',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    recievedParams: { quantity },
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                    
            }
            return await this.productRepository.updateProduct(productId, { stock: newStock });
        } catch (error) {
            throw error;
        }
    };

    getMockingProducts = async () => {
        try {
            const products = await mockingProducts();
            return products;
        } catch (error) {
            throw error;
        }
    }
}

export { ProductService }