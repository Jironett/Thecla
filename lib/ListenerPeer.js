
const EventEmitter = require('events').EventEmitter;

const PeerType = Object.freeze({
    ENDPOINT:   'endpoint',
    TRANSFER:  'transfer'
});

class ListenerPeer extends EventEmitter {

    constructor(type, serverId, transport, otherServerId)
    {
        super(type, serverId, otherServerId);

        this._registerHandlers(transport);
    }

}

module.exports.ListenerPeer = ListenerPeer;