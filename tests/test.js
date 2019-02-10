
const Configuration = require('@netcom/consilium-dei').Configuration;
const Thecla = require('../lib/Thecla');
const logger = require('../lib/Logger');
const http = require('http');
const fs = require('fs');
const config = require('./tests-config');

/* ===== Create configuration schemes from config object ===== */

const cfg1 = new Configuration(config.servers, 1);
const cfg2 = new Configuration(config.servers, 2);

/* ===== Create servers ===== */

/*
const tls =
    {
        cert: fs.readFileSync(config.cert),
        key: fs.readFileSync(config.key)
    };
*/
const emptyResult = (req, res) => {
    res.writeHead(404, 'Not Here');
    res.end();
};

const server1 = http.createServer(emptyResult);
const server2 = http.createServer(emptyResult);

/* ===== Create Thecla instances ===== */

const thecla1 = new Thecla(cfg1, { server: server1 });
const thecla2 = new Thecla(cfg2, { server: server2 });

/* ===== Fire servers ===== */

server1.listen(cfg1.getSelectedPoint().signalServerPort, cfg1.getSelectedPoint().hostname, () => {
    logger.info('Thecla 1 is running.');

    thecla1.fire((peer) => {
        peer.on('error', (error) => {
            logger.error(error);
        });
    });

    server2.listen(cfg2.getSelectedPoint().signalServerPort, cfg2.getSelectedPoint().hostname, () => {
        logger.info('Thecla 2 is running.');

        thecla2.fire((peer) => {
            peer.on('error', (error) => {
                logger.error(error);
            });
        });
    });

});
