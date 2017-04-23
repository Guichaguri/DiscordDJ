"use strict";

const EventEmitter = require('events').EventEmitter;
const stream = require('stream');

const Playable = require('./interfaces/Playable.js');
const Constants = require('./Constants.js');
const VoiceUDPSocket = require('./ws/VoiceUDPSocket.js');
const AudioHelper = require('./audio/AudioHelper.js');
const Utils = require('./Utils.js');

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

        this._playableStream = null; // Loaded Playable stream
        this._audioTimer = null; // Audio clock
        this._state = 0; // 0: Stopped - 1: Paused - 2: Playing
        this._currentFrame = 0; // Current Frame
        this._startTime = 0; // Start Time

        // Opus Audio Options
        this._audioOptions = {
            frameduration: 60, // milliseconds
            samplerate: 48000, // hertz
            bitdepth: 16, // bits
            channels: 2
        };
        this._audioOptions['samplecount'] = AudioHelper.getSampleCount(this._audioOptions);
        this._audioOptions['readsize'] = AudioHelper.getReadSize(this._audioOptions);

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
     * Currently loaded audio stream
     * @type {Stream}
     * @readonly
     */
    get audioStream() {
        return this._playableStream;
    }

    /**
     * Whether it's playing
     * @type {boolean}
     * @readonly
     */
    get playing() {
        return this._playableInterval != null;
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

                let socket = new VoiceUDPSocket(this, endpoint, token, Constants.VOICE_ENCRYPTION_SODIUM);
                socket.once('open', function() {
                    this._socket = socket;
                    resolve();
                }.bind(this));

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

    /**
     * Starts buffering a playable
     * @param {Playable} playable
     * @return {Promise<Stream>}
     */
    buffer(playable) {
        return AudioHelper.buffer(this._discord, playable, this._audioOptions);
    }

    /**
     * Loads a Playable or an Opus stream
     * @param {(Playable|Stream)} p
     * @return {Promise}
     */
    load(p) {
        if(p instanceof Playable) {
            return this.buffer(p).then(function(stream) {
                this._playableStream = stream;
            }.bind(this));
        } else if(Utils.isStream(p)) {
            this._playableStream = p;
            return Promise.resolve();
        } else {
            return Promise.reject('Invalid Playable or stream');
        }
    }

    /** @private */
    _processAudio() {
        if(this._state != 2) return;

        const nextTime = (this._currentFrame + 1) * this._audioOptions['frameduration'] + this._startTime;
        const currentTime = Utils.hrtime();

        if(currentTime < nextTime) {
            const timeleft = Math.round(nextTime - currentTime);
            if(this._audioTimer) clearTimeout(this._audioTimer);
            this._audioTimer = setTimeout(this._processAudio.bind(this), Math.max(timeleft, 0));
            return;
        }

        this._currentFrame++;

        let buffer = this._playableStream.read(this._audioOptions['readsize']);

        if(buffer == null) {
            // No audio to be read.
            this._interpolateBreak();
            return;
        } else if(!Buffer.isBuffer(buffer)) {
            buffer = Buffer.from(buffer);
        }

        this._socket.sendAudio(buffer, this._audioOptions['samplecount']);

        return setImmediate(this._processAudio.bind(this));
    }

    /** @private */
    _interpolateBreak() {
        // We'll send 5 silent packets for interpolation
        for(var i = 0; i < 5; i++) {
            this._socket.sendAudio(Buffer.from([0xF8, 0xFF, 0xFE]), this._audioOptions['samplecount']);
        }

        this._socket.setSpeaking(false);
    }

    /**
     * Starts playing or resume the loaded playable
     */
    play() {
        this._state = 2;
        this._playableStream.once('readable', function() {
            this._socket.setSpeaking(true);
            this._currentFrame = 0;
            this._startTime = Utils.hrtime();
            setImmediate(this._processAudio.bind(this));
        }.bind(this));
    }

    /**
     * Stops playing the loaded playable
     */
    stop() {
        this._state = 0;
        clearTimeout(this._audioTimer);
        this._audioTimer = null;
        this._playableStream.removeAllListeners('readable');
        this._playableStream = null;
        this._interpolateBreak();
    }

    /**
     * Pauses the loaded playable
     */
    pause() {
        this._state = 1;
        clearTimeout(this._audioTimer);
        this._audioTimer = null;
        this._interpolateBreak();
    }
}

module.exports = DJ;
