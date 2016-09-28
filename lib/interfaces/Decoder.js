"use strict";

/**
 * Represents an audio to PCM decoder
 * @class
 */
class Decoder {

    /**
     * Whether this decoder is available
     * @member {boolean}
     * @readonly
     * @static
     */
    static get available() {
        return false;
    }

    /**
     * Whether the mime type is accepted by this decoder
     * @static
     * @param {string} mimetype
     * @return {boolean}
     */
    static accepts(mimetype) {
        return false;
    }

    /**
     * Creates a decoder
     * @param {number} rate - Sample Rate
     * @param {number} channels - Number of channels
     */
    constructor(rate, channels) {

    }

    /**
     * Decodes an audio stream to PCM
     * @param {Stream} stream
     * @return {Stream} - The PCM stream
     */
    decode(stream) {
        return null;
    }

}

module.exports = Decoder;
