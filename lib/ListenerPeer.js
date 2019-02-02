
const Peer = require('./Peer');

class ListenerPeer extends Peer {

    constructor(type, serverId, transport, otherServerId)
    {
        super(type, serverId, otherServerId);

        this._registerHandlers(transport);
    }

}

module.exports.ListenerPeer = ListenerPeer;