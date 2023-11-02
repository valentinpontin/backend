import winston from 'winston';

const createLogger = () => {

    const customLevelOptions = {
        levels: {
            fatal: 0,
            error: 1,
            warning: 2,
            info: 3,
            http: 4,
            debug: 5
        },
        colors: {
            fatal: 'redBG',
            error: 'red',
            warning: 'yellowBG',
            info: 'greenBG',
            http: 'blue',
            debug: 'white'
        }
    };

    const environmentLogLevels = {
        prod: {
            console: 'info',
            file: 'error'
        },
        qa: {
            console: 'debug',
            file: 'error'
        },
        dev: {
            console: 'debug',
            file: 'error'
        }
    };

    const selectedLogLevel = environmentLogLevels[process.env.NODE_ENV];

    const logger = winston.createLogger({
        levels: customLevelOptions.levels,
        transports: [
            new winston.transports.Console(
                {
                    level: selectedLogLevel.console,
                    format: winston.format.combine(
                        winston.format.colorize({ colors: customLevelOptions.colors }),
                        winston.format.simple()
                    )
                }),
            new winston.transports.File(
                {
                    filename: `logs/${process.env.NODE_ENV}.${selectedLogLevel.file}.log`,
                    level: selectedLogLevel.file
                })
        ]
    });

    return logger;
};

export const floweryLogger = (logLevel, logMessage) => {
    const logger = createLogger();
    logger.log(logLevel, ` ${new Date().toLocaleString()} - ${logMessage}` );
};

export const floweryRequestLogger = (req, res, next) => {
    req.logger = createLogger();
    req.logger.http(`${req.method} ${req.originalUrl} - ${req.ip} - ${req.headers['user-agent']} - ${new Date().toLocaleDateString()}`)
    next();
};