
const config = require('./tests-config');
const Configuration = require('@netcom/consilium-dei').Configuration;
const https = require('https');

const cfg = new Configuration(config.servers, thisServerId);

const tls =
    {
        cert: fs.readFileSync(config.cert),
        key: fs.readFileSync(config.key)
    };

const emptyResult = (req, res) => {
    res.writeHead(404, 'Not Here');
    res.end();
};
const firstHttpsServer = https.createServer(tls, emptyResult);
const secondHttpsServer = https.createServer(tls, emptyResult);


const thecla = new Thecla(cfg, { server: theclaHttpsServer });