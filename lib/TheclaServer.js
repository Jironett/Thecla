
const EventEmitter = require('events').EventEmitter;
const WebSocket = require('ws');

class TheclaServer extends EventEmitter {

    constructor(connConfig, thisServerId)
    {
        super();

        if (!Array.isArray(connConfig))
            throw TypeError("Connection configuration has to be an array");

        const thisServerConf = connConfig.filter( server => server.id === thisServerId);

        if (thisServerConf.length === 0)
            throw TypeError("There is not set section corresponding thisServerId");

        this._connConfig = connConfig;

        this._thisServerConf = thisServerConf[0];

        this._wsServer = null;

        this._peers = new Map();
    }

    init(server, verifyClient)
    {
        if (this._wsServer !== null)
            return;

        const verifyClientExtended = (info) => {
            console.log(info.req.theclaServerId, info.origin, info.req);

            if (info.req.theclaServerId && this._peers.has(info.req.theclaServerId))
                return false;

            return (typeof verifyClient === 'function') ? verifyClient(info) : true;
        };

        const options = {
            server: server,
            verifyClient: verifyClientExtended
        };

        this._wsServer = new WebSocket.Server(options);

        this._wsServer.on('connection', (connection) => {

            console.log(connection);
            connection.on('message', function incoming(message) {
                console.log('received: %s', message);
            });

            connection.send('something');
        });
    }

  /*  connectServers()
    {
        this.forNeighborsConfig((scheme, destinationServer, thisServer) => {

        });
    }*/

    forNeighborsConfig(callback)
    {
        for (const connScheme of this._thisServerConf['scheme']){
            let destinationServer = this._connConfig.filter(server => server.id === connScheme.point);
            if (destinationServer.length === 0)
                continue;
            callback(connScheme, destinationServer[0]);
        }
    }

}


module.exports = TheclaServer;

