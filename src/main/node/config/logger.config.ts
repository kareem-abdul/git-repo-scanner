import morgan from 'morgan';
import winston from 'winston';
import { constants } from '@app/constants';
import { properties } from '@properties';

const errorFormat = winston.format((info) => {
    if (info instanceof Error) {
        info.message = info.stack as string;
        return info;
    }
    return info;
});

export const log = winston.createLogger({
    level: properties.logging.level,
    silent: !properties.logging.enabled,
    format: winston.format.combine(
        errorFormat(),
        winston.format.timestamp({ format: constants.LOGGER_TIME_STAMP_FORMAT }),
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} - [${level}]: ${message}`),
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

export const requestLogger = () => morgan('dev', {
    stream: {
        write: (message) => log.debug(message.trim()),
    },
});
