import swaggerUIExpress from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import cors from 'cors';
import { floweryLogger } from '../utils/logger.js';

export default function configureSwagger(app) {

    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Flowery 4107 API',
                version: '1.0.0',
                description: `Flowery 4107 API - Authorization through JWT cookie is not supported in Swagger due to browser security restrictions.
                [More information](https://swagger.io/docs/specification/authentication/cookie-authentication/).
                \`Alternatively, you can get your cookie jwt credentials using the Flowery 4107 login page:\`
                [Flowery login page](${process.env.APP_URL}/login)
                `,
            },
            servers: [
                {
                    description: `${process.env.NODE_ENV} server`,
                    url: `${process.env.APP_URL}`,
                },
            ],
        },
        apis: ['./src/**/*.yaml'],
    };

    const specs = swaggerJsDoc(swaggerOptions);
    app.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs) );

}
