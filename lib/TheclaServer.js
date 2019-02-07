
const InitiatorPeer = require('./InitiatorPeer');
const ListenerPeer = require('./ListenerPeer');
const queryString = require('query-string');
const EventEmitter = require('events');
const WebSocket = require('ws');
const Configuration = require('@netcom/consilium-dei').Configuration;

class TheclaServer extends EventEmitter {

    /**
     * @param {Configuration} config
     */
    constructor(config)
    {
        super();

        if (false === config instanceof Configuration)
            throw TypeError("Config for TheclaServer has to be an instance of Configuration class.");

        /** {Configuration} */
        this._config = config;

        this._wsServer = null;

        /**
         * Contains peers in readyState: connecting, open, closing
         * {Array<InitiatorPeer|ListenerPeer>}
         */
        this._peers = new Map();
    }

    init(wsServerConfig, peerHandlers, verifyClient, initPeerProtocols, initPeerOptions)
    {
        this._initServer(wsServerConfig, peerHandlers, verifyClient);
        this._connectServers(peerHandlers, initPeerProtocols, initPeerOptions);
    }

    /**
     * @param {Object} wsServerConfig - WebSocket.Server configuration
     * @param {Function<Peer>} regHandlers
     * @param {Function<(number|string), Object>} verify
     * @private
     */
    _initServer(wsServerConfig, regHandlers, verify)
    {
        if (this._wsServer !== null)
            return;

        let foreignServerId = null;
        let scheme = null;

        // In incoming request is expected 'serverId' parameter in URL
        const verifyClientExtended = (info) => {
            const url = (info.req.url[0] === '/') ? info.req.url.substr(1) : info.req.url;
            foreignServerId = queryString.parse(url).serverId;

            if (typeof foreignServerId === 'undefined' || this._peers.has(foreignServerId))
                return false;

            scheme = this._config.getSchemeByPointId(foreignServerId);

            if (!scheme)
                return false;

            return (typeof verify === 'function') ? verify(foreignServerId, info) : true;
        };

        wsServerConfig.verifyClient = verifyClientExtended;
        this._wsServer = new WebSocket.Server(wsServerConfig);

        this._wsServer.on('connection', (transport) => {
            const peer = new ListenerPeer(scheme, transport);
            this._setPeer(peer, foreignServerId, regHandlers);

        });
    }

    _connectServers(regHandlers, protocols, options)
    {
        this._config.forSelectedPoint((scheme, foreignServer) => {
            const peer = new InitiatorPeer(scheme, foreignServer.hostname,
                foreignServer.signalServerPort);
            this._setPeer(peer, scheme.getPointId(), regHandlers);
            peer._connectPeer(this._config.getSelectedPointId(), protocols, options);
        });
    }

    _setPeer(peer, foreignServerId, registerPeerHandlers)
    {
        if (this._peers.has(foreignServerId))
            return;

        this._peers.set(foreignServerId, peer);

        peer.on('close', () => {
            this._peers.delete(foreignServerId);
        });

        if (typeof registerPeerHandlers === 'function')
            registerPeerHandlers(peer);

        if (peer instanceof ListenerPeer)
            peer.emit('listener-connection', peer);

        return peer;
    }
}


module.exports = TheclaServer;

