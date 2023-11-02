import { Router } from "express";
import uploader from '../utils/multer.js';
import { authorization } from '../utils/utils.js'
import productController from '../controllers/products.controller.js';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';

const router = Router();

router.get('/', authorization(['admin', 'user', 'premium']), productController.getProducts);

router.get('/mockingproducts', authorization(['admin', 'user', 'premium']), productController.getMockingProducts);

router.get('/:productId', authorization(['admin', 'user', 'premium']), productController.getProductById);

router.post('/', authorization(['admin', 'premium']), uploader('products').array('thumbnails'), productController.addProduct);

router.put('/:productId', authorization(['admin', 'premium']), productController.updateProductById);

router.delete('/:productId', authorization(['admin', 'premium']), productController.deleteProductById);

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
