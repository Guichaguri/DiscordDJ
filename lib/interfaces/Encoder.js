"use strict";

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
     * Encodes a PCM stream to opus packets
     * @static
     * @param {Stream} stream
     * @param {number} rate - Sample Rate
     * @param {number} channels - Number of channels
     * @param {number} frameDuration
     * @return {Stream} - The Opus stream
     */
    static encode(stream, rate, channels, frameDuration) {
        return null;
    }

}

module.exports = Encoder;
