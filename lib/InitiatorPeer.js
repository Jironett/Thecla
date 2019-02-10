
const WebSocket = require('ws');
const Peer = require('./Peer');

class InitiatorPeer extends Peer {

    constructor(foreignServerId, scheme, hostname, port)
    {
        super(foreignServerId, scheme);

        this._hostname = hostname;

        this._port = port;
    }

    _connectPeer(thisServerId, protocols, options)
    {
        if (this._transport)
            return;

        const transport = new WebSocket('wss://' + this._hostname + ':' + this._port
            + '?serverId=' + thisServerId, protocols, options);

        this._registerHandlers(transport);
    }

}

module.exports = InitiatorPeer;