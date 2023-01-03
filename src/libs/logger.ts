import winston from "winston";

import config from "../config";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${new Date(timestamp).toLocaleString()} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [new winston.transports.File({ filename: config.logger.file })]
});

if (config.env !== "production") {
  logger.configure({
    level: "verbose",
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${new Date(timestamp).toLocaleString()} [${level.toUpperCase()}] ${message}`;
      })
    )
  });

  logger.add(
    new winston.transports.Console({
      format: winston.format.colorize({ all: config.logger.colorize })
    })
  );
}

export default logger;
