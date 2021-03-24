import pino from "pino"

export const Logger = pino({
    enabled: process.env.DEBUG !== undefined
})