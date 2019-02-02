
const EventEmitter = require('events').EventEmitter;
const PeerType = require('./PeerType');

class Peer extends EventEmitter {

    constructor(type, serverId, otherServerId)
    {
        super();

        if (type !== PeerType.ENDPOINT && type !== PeerType.TRANSFER)
            throw TypeError('Parameter type of peer is an invalid value.');

        if (type === PeerType.TRANSFER && typeof otherServerId === "undefined")
            throw TypeError('If peer is transfer type then has to be set otherServerId.');

        this._type = type;

        this._serverId = serverId;

        this._otherServerId = otherServerId;

        /** {WebSocket} */
        this._transport = null;
    }

    _registerHandlers(transport)
    {
        if (this._transport)
            return;

        this._transport = transport;

        this._transport.on('open', () => {
            this.emit('open');

            this._transport.send('something' + this._serverId);
        });

        this._transport.on('message', (data) => {
            this.emit('message', data, this._transport.readyState);
            console.log(data);
        });

        this._transport.on('close', (code, reason) => {
            this.emit('close', code, reason);
        });

        this._transport.on('error', (error) => {
            this.emit('error', error);
        });

        this._transport.on('ping', (data) => {
            this.emit('ping', data);
        });

        this._transport.on('pong', (data) => {
            this.emit('pong', data);
        });

        this._transport.on('unexpected-response', (request, response) => {
            this.emit('unexpected-response', request, response);
        });

        this._transport.on('upgrade', (response) => {
            this.emit('upgrade', response);
        });
    }

}

module.exports = Peer;