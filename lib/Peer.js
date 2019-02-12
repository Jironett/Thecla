
const EventEmitter = require('events').EventEmitter;
const Scheme = require('@netcom/consilium-dei').Scheme;
const WebSocket = require('ws');
const logger = require('./Logger');

class Peer extends EventEmitter {

    constructor(foreignServerId, peerScheme)
    {
        super();

        if (false === peerScheme instanceof Scheme)
            throw TypeError('peerScheme has to be an instance of Scheme: ' + peerScheme);

        this._foreignServerId = foreignServerId;

        this._scheme = peerScheme;

        /** {WebSocket} */
        this._transport = null;
    }

    get getForeignServerId()
    {
        return this._foreignServerId;
    }

    _registerHandlers(transport)
    {
        if (this._transport)
            return;

        this._transport = transport;

        this._transport.on('open', () => {
            this.emit('open');
            logger.deepInfo('Open peer with: ' + this._foreignServerId);
        });

        this._transport.on('message', (data) => {
            this.emit('message', data);
            logger.deepInfo('Incomming msg from :' + this._foreignServerId, data);
        });

        this._transport.on('close', (code, reason) => {
            this.emit('close', code, reason);
            logger.deepInfo('Closed peer with: ' + this._foreignServerId);
        });

        this._transport.on('error', (error) => {
            this.emit('error', error);
            logger.error('Error with server: ' + this._foreignServerId, error);
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
        if (!this._transport || this._transport.readyState !== WebSocket.OPEN) {
            logger.error('Message for server' + this._foreignServerId +
                ' could not be send cause of transport.' + msg);
            return false;
        }

        this._transport.send(msg, options, callback);
        this.logger.deepInfo("safeSend msg: ", msg);

        return true;
    }

    close(code, reason)
    {
        if (!this._transport)
            return;

        this._transport.close(code, reason);
    }

}

module.exports = Peer;