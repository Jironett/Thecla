
const WebSocket = require('ws');
const Peer = require('./Peer');

class InitiatorPeer extends Peer {

    constructor(type, serverId, hostname, port, otherServerId)
    {
        super(type, serverId, otherServerId);

        this._hostname = hostname;

        this._port = port;
    }

    _connectPeer(protocols, options)
    {
        if (this._transport)
            return;

        // todo - keep not secure ?
        const transport = new WebSocket('wss://' + this._hostname + ':' + this._port,
            protocols, options);

        this._registerHandlers(transport);
    }

}

module.exports = InitiatorPeer;