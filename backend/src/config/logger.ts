import winston from 'winston';
import path from 'path';
import { config } from './index';

const logDir = path.join(process.cwd(), config.logging.dir);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    ...(config.env !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : []),
  ],
});
