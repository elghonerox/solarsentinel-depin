const winston = require('winston');

/**
 * Winston Logger Configuration
 * 
 * Provides structured logging for:
 * - Development: colorized console output
 * - Production: JSON logs to file
 * - Error tracking: separate error log file
 */

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'solarsentinel-backend' },
  transports: [
    // Write all logs to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let metaString = '';
          if (Object.keys(meta).length > 0 && meta.service !== 'solarsentinel-backend') {
            metaString = ` ${JSON.stringify(meta)}`;
          }
          return `${timestamp} [${level}]: ${message}${metaString}`;
        })
      )
    })
  ]
});

// In production, also write to files
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }));
}

module.exports = logger;