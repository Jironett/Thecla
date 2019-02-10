
const debug = require('debug');

class Logger
{
    constructor()
    {
        this._debug = debug('Thecla:debug');
        this._info = debug('Thecla:info');
        this._warn = debug('Thecla:warn');
        this._error = debug('Thecla:error');
        this._deepInfo = debug('Thecla:deepInfo');

        this._debug.log = console.info.bind(console);
        this._info.log = console.info.bind(console);
        this._warn.log = console.warn.bind(console);
        this._error.log = console.error.bind(console);
        this._deepInfo.log = console.info.bind(console);
    }

    get debug()
    {
        return this._debug;
    }

    get info()
    {
        return this._info;
    }

    get deepInfo()
    {
        return this._deepInfo;
    }

    get warn()
    {
        return this._warn;
    }

    get error()
    {
        return this._error;
    }
}

module.exports = new Logger();
