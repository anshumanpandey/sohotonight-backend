import pino from "pino"

/*export const Logger = pino({
    enabled: process.env.DEBUG !== undefined
})*/

export const Logger = {
    info: (s: string) => console.log(s)
}