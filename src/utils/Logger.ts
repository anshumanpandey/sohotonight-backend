import pino from 'pino';
import GlobalEnv from './validateEnv';

export const Logger = pino({
  enabled: GlobalEnv.LOG_ENABLED === 'CONSOLE',
});

/* export const Logger = {
  info: (s: string) => console.log(s),
}; */

export default Logger;
