
const EventEmitter = require('events').EventEmitter;


class Peer extends EventEmitter {

    constructor()
    {
        super();
    }

}

exports.SignalPeer = Peer;