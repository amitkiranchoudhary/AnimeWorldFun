const winston = require('winston');
const path = require('path');

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logs directory path
const logsDir = path.join(__dirname, '..', 'logs');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    defaultMeta: { service: 'animeworldfun-api' },
    transports: [
        // Console transport — always active
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // File transport — combined log
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport — errors only
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // File transport — access log
        new winston.transports.File({
            filename: path.join(logsDir, 'access.log'),
            level: 'http',
            format: fileFormat,
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

// Stream for Morgan HTTP request logging
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

module.exports = logger;
