import { Router } from 'express';
import { authorization } from '../utils/utils.js';
import { floweryLogger } from '../utils/logger.js';

const router = Router();

router.get('/loggerTest', authorization(['admin']), (req, res) => {
    floweryLogger('debug', 'This is a debug test log');
    floweryLogger('http', 'This is a http test log');
    floweryLogger('info', 'This is a info test log');
    floweryLogger('warning', 'This is a warning test log');
    floweryLogger('error', 'This is an error test log');
    floweryLogger('fatal', 'This is a fatal test log');
    res.send('Flowery 4107 logger test');
});

export default router;