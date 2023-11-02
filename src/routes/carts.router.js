import { Router } from "express";
import { authorization } from '../utils/utils.js'
import cartController from '../controllers/carts.controller.js';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';

const router = Router();

router.post('/', authorization(['user', 'premium']), cartController.createCart);

router.get('/:cartId', authorization(['admin', 'user', 'premium']), cartController.getCartById);

router.put('/:cartId', authorization(['user', 'premium']), cartController.updateCartById);

router.post('/:cartId/products/:productId', authorization(['user', 'premium']), cartController.addProductToCart);

router.delete('/:cartId/products/:productId', authorization(['user', 'premium']), cartController.removeProductFromCart);

router.put('/:cartId/products/:productId', authorization(['user', 'premium']), cartController.updateProductQuantity);

router.delete('/:cartId', authorization(['user', 'premium']), cartController.emptyCart);

router.post('/:cartId/checkout', authorization(['user', 'premium']), cartController.checkoutCart);

router.all('*', (req, res) => {
    FloweryCustomError.createError({
        name: 'Routing Error',
        message: 'Invalid route',
        type: EnumErrors.ROUTING_ERROR.type,
        recievedParams: { route: req.originalUrl },
        statusCode: EnumErrors.ROUTING_ERROR.statusCode
    });    
});

export default router;
