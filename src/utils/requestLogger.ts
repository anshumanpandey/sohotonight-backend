import express from 'express';
import morgan from 'morgan';

const requestLogger = morgan((tokens, req: express.Request, res) => {
  return [
    `[ID ${req.id}]`,
    `[${tokens.method(req, res)}]`,
    `[${tokens.url(req, res)}]`,
    `[${tokens.status(req, res)}]`,
    `[${tokens.res(req, res, 'content-length')}]`,
    '-',
    `[${tokens['response-time'](req, res)}]`,
    'ms',
  ].join(' ');
});

export default requestLogger;
