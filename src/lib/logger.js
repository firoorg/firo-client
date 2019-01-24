import { join } from 'path'
import winston from 'winston'
import { getApp } from '#/lib/utils'

const logger = winston.createLogger({
    format: winston.format.combine(
        //winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: join(getApp().getPath('userData'), 'combined.log'),
            handleExceptions: true
        })
    ]
})

export const createLogger = function (label) {
    console.log(logger)

    return logger
    //return logger.child({ label })
}
