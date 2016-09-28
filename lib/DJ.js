"use strict";

const EventEmitter = require('events').EventEmitter;

const Constants = require('./Constants.js');
const VoiceSocket = require('./ws/VoiceSocket.js');

/**
 * Represents a voice connection.
 * @class
 * @extends EventEmitter
 */
class DJ extends EventEmitter {

    /** @private */
    constructor(discord, guildId, channelId) {
        super();
        this._discord = discord; // Discord instance
        this._guildId = guildId; // Guild ID
        this._channelId = channelId; // Voice Channel ID
        this._socket = null; // VoiceSocket instance
        this._token = null; // Token
        this._endpoint = null; // Endpoint URL

        /**
         * Custom Data
         * @member {?object}
         */
        this.data = null;

        this.on('update-connection', function(token, endpoint) {
            this._token = token;
            this._endpoint = endpoint;

            // Reconnect to the new endpoint
            if(this._socket != null && this._socket.url != endpoint) {
                this.disconnect();
                this.connect();
            }
        }.bind(this));
    }

    /**
     * Guild ID
     * @type {string}
     * @readonly
     */
    get guildId() {
        return this._guildId;
    }

    /**
     * Voice Channel ID
     * @type {string}
     * @readonly
     */
    get channelId() {
        return this._channelId;
    }

    /**
     * Whether it's connected to the voice channel
     * @type {boolean}
     * @readonly
     */
    get connected() {
        return this._socket != null;
    }

    /**
     * Connects to the voice channel
     * @return {Promise}
     */
    connect() {
        if(this.connected) return Promise.reject('Already connected!');

        return new Promise(function(resolve, reject) {

            let createSocket = function(token, endpoint) {
                VoiceSocket.createSocket(this, endpoint, token).then(function(socket) {
                    this._socket = socket;
                    resolve();
                }.bind(this), reject);
            }.bind(this);

            if(this._token == null || this._endpoint == null) {
                this._discord._socket.connectVoice(this.guildId, this.channelId);
                this.once('update-connection', createSocket);
            } else {
                createSocket(this._token, this._endpoint);
            }
        }.bind(this));
    }

    /**
     * Disconnects from the voice channel
     * @return {Promise}
     */
    disconnect() {
        if(!this.connected) return Promise.reject('Already disconnected!');

        this._socket.terminate();
        this._socket = null;

        return Promise.resolve();
    }

}

module.exports = DJ;
