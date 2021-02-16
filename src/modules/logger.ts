import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, prettyPrint } = format;

export default createLogger({
    format: combine(
        label(),
        timestamp(),
        prettyPrint()
    ),
    transports: [new transports.Console()]
});
