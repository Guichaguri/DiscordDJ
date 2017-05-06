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
    static decodes(mimetype) {
        return false;
    }

    /**
     * Decodes an audio stream to PCM
     * @static
     * @param {Stream} stream
     * @param {number} rate - Sample Rate
     * @param {number} channels - Number of channels
     * @return {Stream} - The PCM stream
     */
    static decode(stream, rate, channels) {
        return null;
    }

}

module.exports = Decoder;
