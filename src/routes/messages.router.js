import { Router } from 'express';
import { authorization } from '../utils/utils.js'
import messageController from '../controllers/messages.controller.js';
import EnumErrors from '../utils/errorHandler/enum.js';
import FloweryCustomError from '../utils/errorHandler/FloweryCustomError.js';

const router = Router();

router.get('/', authorization(['admin', 'user', 'premium']), messageController.getMessages);

router.post('/', authorization(['user', 'premium']), messageController.postMessage);

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