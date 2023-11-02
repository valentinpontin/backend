import { Router } from "express";
import { jwtVerify, tokenFromCookieExtractor, authorization } from '../utils/utils.js';
import cookieParser from 'cookie-parser';
import viewsController from "../controllers/views.controller.js";
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';
import { validateResetPasswordToken } from '../config/middlewares.config.js';

const router = Router();
router.use(cookieParser(process.env.AUTH_SECRET));

const publicAccess = (req, res, next) => {
    const token = tokenFromCookieExtractor(req);
    if (token && jwtVerify(token)) {
        return res.redirect('/products');
    }
    next();
};

const privateAccess = (req, res, next) => {
    const token = tokenFromCookieExtractor(req);
    const decodedToken = jwtVerify(token);
    if (token && decodedToken) {
        req.user = decodedToken.user;
        return next();
    }
    res.redirect('/login');
};

router.get('/register', publicAccess, viewsController.register);

router.get('/login', publicAccess, viewsController.login);

router.get('/resetpasswordrequest', publicAccess, viewsController.resetPasswordRequest);

router.get('/resetpassword/:token', validateResetPasswordToken(true), viewsController.resetPassword);

router.get('/', privateAccess, viewsController.userProfile);

router.get('/staticProducts', privateAccess, viewsController.staticProducts);

router.get('/realtimeproducts', privateAccess, viewsController.realTimeProducts);

router.get('/webchat', privateAccess, viewsController.webchat);

router.get('/products', privateAccess, viewsController.products);

router.get('/carts/:cartId', privateAccess, viewsController.carts);

router.get('/users', privateAccess, authorization('admin'), viewsController.users);

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