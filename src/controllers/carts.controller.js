import { CartService } from "../services/carts.services.js";

const cartService = new CartService();

const createCart = async (req, res, next) => {
    try {
        const newCart = await cartService.createCart();
        res.status(201).send({ status: 1, msg: 'Cart added successfully', cartId: newCart._id });
    } catch (error) {
        next(error);
    }
};

const getCartById = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const cart = await cartService.getCartById(cartId);
        res.json({ status: 1, cart });
    } catch (error) {
        next(error);
    }
};

const updateCartById = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const products = req.body.products;
        const cart = await cartService.addProductsToCart(cartId, products, req.user)
        res.status(201).send({ status: 1, msg: 'Cart updated successfully', cartProducts: cart.products });
    } catch (error) {
        next(error);
    }
};

const addProductToCart = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const cart = await cartService.addToCart(cartId, productId, req.user);
        res.status(201).send({ status: 1, msg: 'Product added to cart successfully', cart });
    } catch (error) {
        next(error);
    }
};

const removeProductFromCart = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const cart = await cartService.removeFromCart(cartId, productId);
        res.status(201).send({ status: 1, msg: 'Product deleted from cart successfully', cart });
    } catch (error) {
        next(error);
    }
};

const updateProductQuantity = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const quantity = req.body.quantity;
        const cart = await cartService.updateProductQuantity(cartId, productId, quantity);
        res.status(201).send({ status: 1, msg: 'Product quantity updated successfully', cart });
    } catch (error) {
        next(error);
    }
};

const emptyCart = async (req, res, next) => {
    const cartId = req.params.cartId;

    try {
        const emptiedCart = await cartService.emptyCart(cartId);
        res.status(200).send({ status: 1, msg: 'Cart successfully emptied', cart: emptiedCart });
    } catch (error) {
        next(error);
    }
};

const checkoutCart = async (req, res, next) => {
    const cartId = req.params.cartId;
    try {
        const purchaseCartResult = await cartService.checkoutCart(cartId, req.user.email);
        res.status(201).send({ status: 1, msg: 'Cart successfully purchased', purchaseCartResult: purchaseCartResult });
    } catch (error) {
        next(error);
    }
};

export default {
    createCart,
    getCartById,
    updateCartById,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    emptyCart,
    checkoutCart
};
