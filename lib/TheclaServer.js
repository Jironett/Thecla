
const Peer = require('lib/Peer');
const InitiatorPeer = require('lib/InitiatorPeer');
const ListenerPeer = require('lib/ListenerPeer');
const EventEmitter = require('events');
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

    fire(server, registerPeerHandlers, verifyClient)
    {
        this._initServer(server, verifyClient, registerPeerHandlers);
        this._connectServers(registerPeerHandlers);
    }

    _initServer(server, verifyClient, registerPeerHandlers)
    {
        if (this._wsServer !== null)
            return;

        let sourceServerId = null;

        const verifyClientExtended = (info) => {
            console.log(info.req.theclaServerId, info.origin, info.req);

            if (info.req.theclaServerId && this._peers.has(info.req.theclaServerId))
                return false;

            sourceServerId = info.req.theclaServerId;
            return (typeof verifyClient === 'function') ? verifyClient(info) : true;
        };

        const options = {
            server: server,
            verifyClient: verifyClientExtended
        };

        this._wsServer = new WebSocket.Server(options);

        this._wsServer.on('connection', (transport) => {
            console.log("connected", sourceServerId);
            //const peer = new ListenerPeer();

            this.emit('listener-connection');
            transport.send('something');
        });
    }

    _connectServers(registerPeerHandlers)
    {
        this.forNeighborsConfig((scheme, destServer) => {
            if (this._peers.has(scheme.point))
                return;

            const peer = new InitiatorPeer(scheme.type, scheme.point, destServer.hostname,
                destServer.port, scheme.otherPoint);

            this._peers.set(scheme.point, peer);

            if (typeof registerPeerHandlers === 'function')
                registerPeerHandlers(peer);

            peer._connectPeer();
        });
    }

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

