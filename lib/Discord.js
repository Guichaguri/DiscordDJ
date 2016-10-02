"use strict";

const EventEmitter = require('events').EventEmitter;
const DiscordSocket = require('./ws/DiscordSocket.js');
const DJ = require('./DJ.js');

/**
 * Represents a Discord client.
 * @class
 * @extends EventEmitter
 */
class Discord extends EventEmitter {

    /**
     * @constructor
     * @param {string} token - Access token
     * @param {number} currentShard - Current shard entry number
     * @param {number} totalShards - Total amount of shards
     */
    constructor(token, currentShard, totalShards) {
        super();
        this._token = token; // Bot token
        this._currentShard = typeof currentShard == 'number' ? currentShard : 0; // Current shard
        this._totalShards = typeof totalShards == 'number' ? totalShards : 1; // Total shards
        this._gateway = null; // Gateway URL
        this._socket = null; // DiscordSocket instance
        this._djs = []; // DJ instances

        /** @member {Component[]} */
        this.components = [];
        /** @member {Class<Encoder>[]} */
        this.encoders = [];
        /** @member {Class<Decoder>[]} */
        this.decoders = [];
        /** @member {Class<Playable>[]} */
        this.playables = [];
        /** @member {Class<Playlist>[]} */
        this.playlists = [];
    }

    /**
     * Discord Access Token
     * @type {string}
     * @readonly
     */
    get token() {
        return this._token;
    }

    /**
     * Current shard entry
     * @type {number}
     * @readonly
     */
    get shard() {
        return this._currentShard;
    }

    /**
     * The created DJs
     * @type {DJ[]}
     * @readonly
     */
    get djs() {
        return this._djs;
    }

    /**
     * Whether it's connected to Discord
     * @type {boolean}
     * @readonly
     */
    get connected() {
        return this.socket != null;
    }

    /**
     * Connects to Discord
     * This will not connect DJs
     * @return {Promise}
     */
    connect() {
        if(this.connected) return Promise.reject('Already connected!');

        return new Promise(function(resolve, reject) {
            var r = function(socket) {
                this._socket = socket;
                resolve();
            }.bind(this);

            if(this._gateway == null) {
                DiscordSocket.retrieveGatewayURL().then(function(gateway) {
                    this._gateway = gateway;
                    DiscordSocket.createSocket(gateway, this).then(r, reject);
                }.bind(this), reject);
            } else {
                DiscordSocket.createSocket(this._gateway, this).then(r, reject);
            }
        }.bind(this));
    }

    /**
     * Disconnects from Discord
     * This will not disconnect DJs, so make sure you disconnect them too.
     * @return {Promise}
     */
    disconnect() {
        if(!this.connected) return Promise.reject('Already disconnected!');

        this._socket.terminate();
        this._socket = null;

        return Promise.resolve();
    }

    /**
     * Creates a DJ
     * @param {string} guildId - Guild ID
     * @param {string} channelId - Voice Channel ID
     * @return {DJ}
     */
    createDJ(guildId, channelId) {
        var dj = new DJ(this, guildId, channelId);
        this._djs.push(dj);
        return dj;
    }

}

module.exports = Discord;
