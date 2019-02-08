
const EventEmitter = require('events').EventEmitter;
const Scheme = require('@netcom/consilium-dei').Scheme;
const WebSocket = require('ws');

class Peer extends EventEmitter {

    constructor(peerScheme)
    {
        super();

        if (false === peerScheme instanceof Scheme)
            throw TypeError('peerScheme has to be an instance of Scheme: ' + peerScheme);

        this._scheme = peerScheme;

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
        });

        this._transport.on('message', (data) => {
            this.emit('message', data);
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

    safeSend(msg, options, callback)
    {
        if (!this._transport || this._transport.readyState !== WebSocket.OPEN)
            return false;

        this._transport.send(msg, options, callback);

        return true;
    }

}

module.exports = Peer;