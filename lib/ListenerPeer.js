
const Peer = require('./Peer');

class ListenerPeer extends Peer {

    constructor(scheme, transport)
    {
        super(scheme);

        this._registerHandlers(transport);
    }

}

module.exports = ListenerPeer;