import winston from 'winston';
import path from 'path';

// Define the custom settings for each transport
const options = {
  file: {
    level: 'info',
    filename: path.join(__dirname, '../../logs/app.log'),
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  },
};

// Create a Winston logger with the configurations
export const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// Create a stream object with a write function to be used by Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
}; 