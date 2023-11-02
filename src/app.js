import configureCommander from './config/commander.config.js';
import configureDotenv, { envFileName } from './config/dotenv.config.js';
import configureMongo from './config/mongoDB.config.js';
import express from 'express';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import { configureMiddlewares , configurePostMiddlewares} from './config/middlewares.config.js';
import configureHandlebars from './config/handlebars.config.js';
import configurePublicFolder from './config/public.config.js';
import routes from './routes/index.js';
import configureSwagger from './config/swagger.config.js';
import configureSocket from './config/socket.config.js';
import displayRoutes from 'express-routemap';
import { floweryLogger } from './utils/logger.js';

const env = configureCommander();
configureDotenv(env);

configureMongo();

const app = express();
configureMiddlewares(app);
configureHandlebars(app);
initializePassport(passport);
app.use(passport.initialize());
configurePublicFolder(app);
configureSwagger(app);
routes(app);

const PORT = process.env.PORT;

const serverHttp = app.listen(PORT, () => {
    displayRoutes(app);
    floweryLogger('info', `Flowery 4107 Backend server is now up on port ${PORT} in ${env} mode using ${envFileName} file`);
});

configureSocket(serverHttp, app);

configurePostMiddlewares(app);