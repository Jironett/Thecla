
const InitiatorPeer = require('./InitiatorPeer');
const ListenerPeer = require('./ListenerPeer');
const queryString = require('query-string');
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

        /** {Array<InitiatorPeer|ListenerPeer>} - peers in readyState: connecting, open, closing */
        this._peers = new Map();
    }

    fire(server, registerPeerHandlers, verifyClient, initPeerProtocols, initPeerOptions)
    {
        this._initServer(server, verifyClient, registerPeerHandlers);
        this._connectServers(registerPeerHandlers, initPeerProtocols, initPeerOptions);
    }

    _initServer(server, verifyClient, registerPeerHandlers)
    {
        if (this._wsServer !== null)
            return;

        let sourceServerId;

        const verifyClientExtended = (info) => {
            const url = (info.req.url[0] === '/') ? info.req.url.substr(1) : info.req.url;
            sourceServerId = queryString.parse(url).serverId;

            if (typeof sourceServerId !== 'undefined' && this._peers.has(sourceServerId))
                return false;

            return (typeof verifyClient === 'function') ? verifyClient(sourceServerId, info) : true;
        };

        this._wsServer = new WebSocket.Server({ server, verifyClient : verifyClientExtended });

        this._wsServer.on('connection', (transport) => {

            const scheme = this.getNeighborConfig(sourceServerId).scheme;
            const peer = new ListenerPeer(scheme.type, sourceServerId, transport,
                    scheme.otherPoint);
            this._setPeer(peer, sourceServerId, registerPeerHandlers);
            this.emit('listener-connection');

                    console.log("connected", sourceServerId);
                    transport.send('something');
        });
    }

    _connectServers(registerPeerHandlers, protocols, options)
    {
        this.forConfigNeighborServers((scheme, destServer) => {
            if (this._peers.has(scheme.point))
                return;

            const peer = new InitiatorPeer(scheme.type, scheme.point, destServer.hostname,
                destServer.port, scheme.otherPoint);

            this._setPeer(peer, scheme.point, registerPeerHandlers);
            peer._connectPeer(this._thisServerConf.id, protocols, options);
        });
    }

    _setPeer(peer, destServerId, registerPeerHandlers)
    {
        this._peers.set(destServerId, peer);

        peer.on('close', () => {
            this._peers.delete(destServerId);
        });

        if (typeof registerPeerHandlers === 'function')
            registerPeerHandlers(peer);
    }

    forConfigNeighborServers(callback)
    {
        for (const connScheme of this._thisServerConf['scheme']){
            let destinationServer = this._connConfig.filter(server => server.id === connScheme.point);
            if (destinationServer.length === 0)
                continue;
            callback(connScheme, destinationServer[0]);
        }
    }

    getNeighborConfig(searchedServerId)
    {
        this.forConfigNeighborServers((scheme, destServer) => {
            if (scheme.point === searchedServerId){
                return { scheme, destServer };
            }
        });
        return { scheme: {}, destServer: {} };
    }

}


module.exports = TheclaServer;

