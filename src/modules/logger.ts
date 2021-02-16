import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [new transports.Console()]
});

const stream = {
    write: (message: string) => {
      logger.info(message);
    }
}

export { logger, stream };