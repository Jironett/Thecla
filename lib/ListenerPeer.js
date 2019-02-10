
const Peer = require('./Peer');

class ListenerPeer extends Peer {

    constructor(foreignServerId, scheme, transport)
    {
        super(foreignServerId, scheme);

        this._registerHandlers(transport);
    }

}

module.exports = ListenerPeer;