require('dotenv').config()
import {app, bootstrap, httpServer, httpsServer} from './app'
import {AddressInfo} from 'net'
import sequelize from './utils/DB';

bootstrap()
.then(() => sequelize.sync())
.then(() => {
    const logConnection = (server: any) => () => {
        const {port, address} = server.address() as AddressInfo;
        console.log('Server listening on:','http://' + address + ':'+port);
    }
    const httpPort = parseInt(process.env.PORT || '5000') || 5000
    const httpsPort = parseInt(process.env.HTTPS_PORT || '5001') || 5001
    httpServer.listen(httpPort, logConnection(httpServer));
    httpsServer?.listen(httpsPort, logConnection(httpsServer));
})