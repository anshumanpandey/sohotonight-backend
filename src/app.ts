import express from 'express';
import { join } from "path"
import * as bodyParser from 'body-parser';
import sequelize from './utils/DB';
import { routes } from './routes';
import { ApiError } from './utils/ApiError';
const morgan = require('morgan')
const cors = require('cors')
import * as https from "https"
import * as http from "http"
const fs = require('fs');

const app = express();

app.use(cors())
app.use(morgan("tiny"))
app.use(bodyParser.json({
    limit: '50mb',
    verify(req: any, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
}));

app.use("/authImages", express.static(join(__dirname, '..', 'authImages')));
app.use("/banners", express.static(join(__dirname, '..', 'banners')));
app.use("/videos", express.static(join(__dirname, '..', 'videos')));
app.use("/profilePic", express.static(join(__dirname, '..', 'profilePic')));
app.use("/pictures", express.static(join(__dirname, '..', 'pictures')));
app.use(express.static(join(__dirname, '../templates')));

app.use('/api', routes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.code).json({
            statusCode: err.code,
            message: err.message
        });
        return
    } else if (err.name === 'UnauthorizedError') {
        console.log(err)
        res.status(401).send({
            statusCode: 401,
            message: "Unauthorized"
        });
    }
    else {
        console.log(err)
        res.status(500).json({
            statusCode: 500,
            message: "UNKWON ERROR"
        });
        return
    }
});

const bootstrap = () => {
    return sequelize.authenticate()
}

if (process.env.HTTPS_ENABLED) {
    var privateKey  = fs.readFileSync('../privkey.pem', 'utf8');
    var certificate = fs.readFileSync('../cert.pem', 'utf8');
    var credentials = {key: privateKey, cert: certificate};
    var httpsServer = https.createServer(credentials, app);
}

var httpServer = http.createServer(app);

export {
    app,
    httpServer,
    httpsServer,
    bootstrap
};