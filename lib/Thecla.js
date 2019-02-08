
const InitiatorPeer = require('./InitiatorPeer');
const ListenerPeer = require('./ListenerPeer');
const queryString = require('query-string');
const EventEmitter = require('events');
const WebSocket = require('ws');
const Configuration = require('@netcom/consilium-dei').Configuration;

class Thecla extends EventEmitter {

    /**
     * @param {Configuration} config
     * @param {Object} wsServerConfig
     * @param {Object} initPeerProtocols
     * @param {Object} initPeerOptions
     */
    constructor(config, wsServerConfig, initPeerProtocols, initPeerOptions)
    {
        super();

        if (false === config instanceof Configuration)
            throw TypeError("Config for Thecla has to be an instance of Configuration.");

        /** {Configuration} */
        this._config = config;

        /** {WebSocketServer} */
        this._wsServer = null;

        this._wsServerConfig = wsServerConfig;

        this._initPeerProtocols = initPeerProtocols;

        this._initPeerOptions = initPeerOptions;

        /**
         * Contains peers in readyState: connecting, open, closing
         * {Map<(string|number) targetPointId, (InitiatorPeer|ListenerPeer)>}
         */
        this._peers = new Map();
    }

    fire(peerHandlers, verifyClient)
    {
        this._initServer(peerHandlers, verifyClient);
        this._connectServers(peerHandlers);
    }

    /**
     * @param {Function<Peer>} registerPeerHandlers
     * @param {Function<(number|string), Object>} verify
     * @private
     */
    _initServer(registerPeerHandlers, verify)
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

            scheme = this._config.getSchemeByTargetId(foreignServerId);

            if (!scheme)
                return false;

            return (typeof verify === 'function') ? verify(foreignServerId, info) : true;
        };

        const config = Object.assign({}, this._wsServerConfig);
        config.verifyClient = verifyClientExtended;
        this._wsServer = new WebSocket.Server(config);

        this._wsServer.on('connection', (transport) => {
            const peer = new ListenerPeer(scheme, transport);
            this._setPeer(peer, foreignServerId, registerPeerHandlers);
        });
    }

    _connectServers(registerPeerHandlers)
    {
        this._config.forSelectedPoint((scheme, foreignServer) => {
            const peer = new InitiatorPeer(scheme, foreignServer.hostname,
                foreignServer.signalServerPort);

            this._setPeer(peer, scheme.getTargetId(), registerPeerHandlers);

            peer._connectPeer(this._config.getSelectedPointId(),
                this._initPeerProtocols, this._initPeerOptions);
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

    spread(message, exclude = [], options = {}, afterSendEach)
    {
        const send = (scheme, foreignServer) => {

            const peer = this._peers.get(foreignServer.getId());

            if (typeof peer === 'undefined')
                return;

            peer.safeSend(message, options, afterSendEach);
        };

        this._config.forSelectedPoint(send, exclude);
        this.emit('spread');
    }
}


module.exports = Thecla;

