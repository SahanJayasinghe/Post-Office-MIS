const winston = require('winston');
 
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'winston-logs/error.log', level: 'warn' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'winston-logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'winston-logs/rejections.log' })
    ]
});

logger.add(new winston.transports.Console({    
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint()
    ),
    handleExceptions: true
}));

module.exports = logger;