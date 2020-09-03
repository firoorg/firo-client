import { join } from 'path'
import winston from 'winston'
import { getApp } from 'lib/utils'

let logPath;
if (process.env.ZCOIN_CLIENT_TEST) {
    logPath = join(process.cwd(), 'zcoin-client-test.log');
} else {
    logPath = join(getApp().getPath('userData'), 'zcoin-client.log')
}

console.info(`Logs will be written to ${logPath}`);

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        //winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(info => {
            const label = info.label ? `[${info.label}] ` : ''
            return `${info.timestamp} ${label}${info.level}: ${info.message}`
        })
    ),
    transports: [
        new winston.transports.Console({
            level: process.env.ZCOIN_CLIENT_DEBUG_LEVEL || 'debug',
            handleExceptions: true
        }),
        new winston.transports.File({
            filename: logPath,
            handleExceptions: true,
	        level: process.env.ZCOIN_CLIENT_DEBUG_LEVEL || 'info',
        })
    ]
})

export const createLogger = function (label = 'zcoin:no-module') {
    return logger.child({ label })
}
