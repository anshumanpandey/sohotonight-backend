import express from 'express';
import { join } from 'path';
import * as bodyParser from 'body-parser';
import addRequestId from 'express-request-id';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import cors from 'cors';
import sequelize from './utils/DB';
import { routes } from './routes';
import { ApiError } from './utils/ApiError';
import requestLogger from './utils/requestLogger';
import { seedAppConfig } from './seed/SeedAppConfig';
import { startSocketServer } from './socketApp';
import { seedService } from './seed/SeedModelServices';
import LoggerTool from './utils/Logger';

const app = express();

app.use(addRequestId());
app.use(cors());
app.use(requestLogger);
app.use(
  bodyParser.json({
    limit: '100mb',
    verify(req: express.Request, res, buf) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.rawBody = buf;
    },
  }),
);
app.use(
  bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000,
  }),
);

app.use('/authImages', express.static(join(__dirname, '..', 'authImages')));
app.use('/banners', express.static(join(__dirname, '..', 'banners')));
app.use('/videos', express.static(join(__dirname, '..', 'videos')));
app.use('/profilePic', express.static(join(__dirname, '..', 'profilePic')));
app.use('/pictures', express.static(join(__dirname, '..', 'pictures')));
app.use('/publicAssets', express.static(join(__dirname, '..', 'assets')));
app.use(express.static(join(__dirname, '../templates')));

app.use('/api', routes);

app.use((err: express.Errback, req: express.Request, res: express.Response, _: express.NextFunction) => {
  if (err instanceof ApiError) {
    LoggerTool.error({ err, 'id-req': req.id });
    res.status(err.code).json({
      statusCode: err.code,
      message: err.message,
    });
  } else if (err.name === 'UnauthorizedError') {
    console.log('UnauthorizedError', err);
    res.status(401).send({
      statusCode: 401,
      message: 'Unauthorized',
    });
  } else {
    LoggerTool.fatal({ err, 'id-req': req.id });
    res.status(500).json({
      statusCode: 500,
      message: 'Unknown Error',
    });
  }
});

const bootstrap = () => {
  return sequelize
    .authenticate()
    .then(() => seedAppConfig())
    .then(() => seedService());
};

let httpsServer: null | https.Server = null;

if (process.env.HTTPS_ENABLED === '1') {
  const privateKey = fs.readFileSync(join(__dirname, '..', 'privkey.key'), 'utf8');
  const certificate = fs.readFileSync(join(__dirname, '..', 'cert.crt'), 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  httpsServer = https.createServer(credentials, app);
}

const httpServer = http.createServer(app);
startSocketServer(httpServer);

export { app, httpServer, httpsServer, bootstrap };
