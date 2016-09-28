"use strict";

const EventEmitter = require('events').EventEmitter;

/**
 * Represents a PCM to Opus packets encoder
 * @class
 */
class Encoder {

    /**
     * Whether this encoder is available
     * @member {boolean}
     * @readonly
     * @static
     */
    static get available() {
        return false;
    }

    /**
     * Creates an encoder
     * @param {number} rate - Sample Rate
     * @param {number} channels - Number of channels
     */
    constructor(rate, channels) {

    }

    /**
     * Encodes a PCM stream to opus packets
     * @param {Stream} stream
     * @param {number} frameDuration
     * @return {Stream} - The Opus stream
     */
    encode(stream, frameDuration) {
        return null;
    }

}

module.exports = Encoder;
