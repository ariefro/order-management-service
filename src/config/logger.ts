import { existsSync, mkdirSync } from 'fs';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = './logs';

if(!existsSync(logDir)) {
    mkdirSync(logDir)
}

export type Logger = winston.Logger;

const logger: Logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
            dirname: logDir,
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
})

export default logger;
