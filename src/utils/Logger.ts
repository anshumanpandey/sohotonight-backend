// import pino from 'pino';

// export const Logger = pino({});

export const Logger = {
  info: (s: string) => console.log(s),
};

export default Logger;
