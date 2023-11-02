import { cartsRepository } from '../repositories/index.js';
import { ProductService } from './products.services.js';
import { TicketService } from './tickets.services.js';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';
class CartService {

    constructor() {
        this.cartRepository = cartsRepository;
        this.productService = new ProductService();
        this.ticketService = new TicketService();
    }

    createCart = async () => {
        try {
            const newCart = await this.cartRepository.createCart();
            return newCart;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'createCart Error',
                message: `Failed to add cart: ${error.message}`,                        
                type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
            });                    
        }
    }

    getCartById = async (cartId) => {
        try {
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'getCartById Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            return cart;
        } catch (error) {
            throw error;
        }
    }

    checkProductStock = async (productId, quantity) => {
        try {
            const product = await this.productService.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'checkProductStock Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (product.stock < quantity) {
                FloweryCustomError.createError({
                    name: 'checkProductStock Error',
                    message: 'Insufficient stock',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    recievedParams: { quantity },
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                
            }
        } catch (error) {
            throw error;
        }
    }

    addToCart = async (cartId, productId, user) => {
        try {
            let stockControl = 0;
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'addToCart Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (!productId) {
                FloweryCustomError.createError({
                    name: 'addToCart Error',
                    message: 'Product ID is required',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                    
            }
            const product = await this.productService.getProductById(productId);
            if (!product) {
                FloweryCustomError.createError({
                    name: 'addToCart Error',
                    message: 'Product not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (user) {
                if (user.role === 'premium') {
                    if (product.owner.toLowerCase() === user.email.toLowerCase()) {
                        FloweryCustomError.createError({
                            name: 'addToCart Error',
                            message: 'You cannot add your own products to cart',                    
                            type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                            recievedParams: { productId },
                            statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                        });
                    }
                }
            }
            const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
                stockControl = existingProduct.quantity;
            } else {
                cart.products.push({ product: product, quantity: 1 })
                stockControl = 1;
            }
            await this.checkProductStock(productId, stockControl);
            await this.cartRepository.updateCartProducts(cartId, cart.products);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    removeFromCart = async (cartId, productId) => {
        try {
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'removeFromCart Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (!productId) {
                FloweryCustomError.createError({
                    name: 'removeFromCart Error',
                    message: 'Product ID is required',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                    
            }
            const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
            if (!existingProduct) {
                FloweryCustomError.createError({
                    name: 'removeFromCart Error',
                    message: 'Product not found in cart',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            existingProduct.quantity -= 1;
            if (existingProduct.quantity === 0) {
                cart.products = cart.products.filter((product) => product.product._id.toString() !== productId);
            }
            await this.cartRepository.updateCartProducts(cartId, cart.products);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    updateProductQuantity = async (cartId, productId, quantity) => {
        try {
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'updateProductQuantity Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (!productId) {
                FloweryCustomError.createError({
                    name: 'updateProductQuantity Error',
                    message: 'Product ID is required',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                    
            }
            const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
            if (!existingProduct) {
                FloweryCustomError.createError({
                    name: 'updateProductQuantity Error',
                    message: 'Product not found in cart',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { productId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (!quantity) {
                FloweryCustomError.createError({
                    name: 'updateProductQuantity Error',
                    message: 'Quantity is required',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                    
            }
            if (quantity <= 0) {
                FloweryCustomError.createError({
                    name: 'updateProductQuantity Error',
                    message: 'Quantity cannot be zero or negative',                        
                    type: EnumErrors.INVALID_FIELDS_VALUE_ERROR.type,
                    recievedParams: { quantity },
                    statusCode: EnumErrors.INVALID_FIELDS_VALUE_ERROR.statusCode
                });                    
            }
            existingProduct.quantity = quantity;
            await this.cartRepository.updateCartProducts(cartId, cart.products);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    emptyCart = async (cartId) => {
        try {
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'emptyCart Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            cart.products = [];
            await this.cartRepository.updateCartProducts(cartId, cart.products);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    addProductsToCart = async (cartId, products, user) => {
        try {
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'addProductsToCart Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (!products || !Array.isArray(products) || products.length === 0) {
                FloweryCustomError.createError({
                    name: 'addProductsToCart Error',
                    message: 'Invalid product list',                        
                    type: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.type,
                    statusCode: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.statusCode
                });                    
            }
            const existingProducts = cart.products.map((product) => product.product._id.toString());
            const productsToAdd = [];
            const productsToUpdate = [];
            for (const productData of products) {
                const { productId, quantity } = productData;
                if (!productId) {
                    FloweryCustomError.createError({
                        name: 'addProductsToCart Error',
                        message: 'Product ID is required',                        
                        type: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.type,
                        statusCode: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.statusCode
                    });                    
                }
                if (!quantity || quantity <= 0) {
                    FloweryCustomError.createError({
                        name: 'addProductsToCart Error',
                        message: 'Valid quantity is required',                        
                        type: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.type,
                        statusCode: EnumErrors.INVALID_BODY_STRUCTURE_ERROR.statusCode
                    });                    
                }
                const product = await this.productService.getProductById(productId);
                if (!product) {
                    FloweryCustomError.createError({
                        name: 'addProductsToCart Error',
                        message: 'Product not found',                        
                        type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                        recievedParams: { productId },
                        statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                    });                    
                }
                if (user) {
                    if (user.role === 'premium') {
                        if (product.owner.toLowerCase() === user.email.toLowerCase()) {
                            FloweryCustomError.createError({
                                name: 'addProductsToCart Error',
                                message: 'You cannot add your own products to cart',                    
                                type: EnumErrors.BUSSINESS_RULES_ERROR.type,
                                recievedParams: { productId },
                                statusCode: EnumErrors.BUSSINESS_RULES_ERROR.statusCode
                            });
                        }
                    }
                }
                if (existingProducts.includes(productId)) {
                    const existingProduct = cart.products.find((product) => product.product._id.toString() === productId);
                    existingProduct.quantity += quantity;
                    productsToUpdate.push(existingProduct);
                } else {
                    productsToAdd.push({ product: product, quantity: quantity });
                }
            }
            cart.products.push(...productsToAdd);
            await this.cartRepository.updateCartProducts(cartId, cart.products);
            return cart;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'addProductsToCart Error',
                message: `Failed to add products to cart: ${error.message}`,                        
                type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
            });                    
        }
    }

    checkoutCart = async (cartId, purchaser) => {
        try {
            const cart = await this.cartRepository.getCartById(cartId);
            if (!cart) {
                FloweryCustomError.createError({
                    name: 'checkoutCart Error',
                    message: 'Cart not found',                        
                    type: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.type,
                    recievedParams: { cartId },
                    statusCode: EnumErrors.NOT_FOUND_ENTITY_ID_ERROR.statusCode
                });                    
            }
            if (cart.products.length === 0) {
                FloweryCustomError.createError({
                    name: 'checkoutCart Error',
                    message: 'Cart is empty',                        
                    type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                    statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
                });                    
            }
            const products = cart.products;

            const productsPurchased = [];
            const productsNotPurchased = [];

            for (const product of products) {
                try {
                    await this.productService.updateProductStock(product.product._id.toString(), -product.quantity);
                    productsPurchased.push(product);
                } catch (error) {
                    productsNotPurchased.push(product);
                }
            }

            if (productsPurchased.length === 0) {
                FloweryCustomError.createError({
                    name: 'checkoutCart Error',
                    message: 'No products were purchased',                        
                    type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                    statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
                });                    
            }

            await this.emptyCart(cartId);
            if (productsNotPurchased.length > 0) {
                const newCartProducts = productsNotPurchased.map((product) => {
                    return { productId: product.product._id.toString(), quantity: product.quantity }
                });
                await this.addProductsToCart(cartId, newCartProducts);
            }
            const remainingCart = await this.getCartById(cartId);

            const totalAmount = productsPurchased.reduce((total, product) => total + (product.product.price * product.quantity), 0);
            const newTicket = await this.ticketService.createTicket({ amount: totalAmount, purchaser: purchaser });

            if (!newTicket) {
                FloweryCustomError.createError({
                    name: 'checkoutCart Error',
                    message: 'Failed to create ticket',                        
                    type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                    statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
                });                    
            }

            const purchaseCartResult = {
                ticket: newTicket,
                productsPurchased: productsPurchased,
                productsNotPurchased: productsNotPurchased,
                remainingCart: remainingCart
            }

            return purchaseCartResult;
        } catch (error) {
            FloweryCustomError.createError({
                name: 'checkoutCart Error',
                message: `Failed to purchase cart: ${error.message}`,                        
                type: EnumErrors.BUSSINESS_TRANSACTION_ERROR.type,
                statusCode: EnumErrors.BUSSINESS_TRANSACTION_ERROR.statusCode
            });             
        }
    }
}

export { CartService };