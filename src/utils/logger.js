const winston = require('winston');
require('winston-daily-rotate-file');
const express = require('express');

const app = express();

const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  maxSize: '5m',
  maxFiles: '2d',
  dirname: 'logs'
});

fileTransport.on('new', (newFilename) => {
  // yet to implement
});

let logger;

if (app.get('env') === 'development') {
  logger = winston.createLogger({
    level: 'info',
    transports: new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple()
      )
    })
  });
} else if (app.get('env') === 'production') {
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      fileTransport,
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.simple()
        )
      })
    ]
  });
}

module.exports = logger;
