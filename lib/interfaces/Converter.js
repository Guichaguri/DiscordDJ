"use strict";

const Decoder = require('./Decoder.js');
const Encoder = require('./Encoder.js');
const Utils = require('../Utils.js');

/**
 * A converter is an audio decoder and opus encoder at the same time
 * @class
 * @extends Decoder
 * @extends Encoder
 */
class Converter {

    /**
     * Whether this converter is available
     * @member {boolean}
     * @readonly
     * @static
     */
    static get available() {
        return false;
    }

    /**
     * Whether the mime type can be converted
     * @static
     * @param {string} mimetype
     * @return {boolean}
     */
    static converts(mimetype) {
        return false;
    }

    /**
     * Whether the mime type can be decoded
     * @static
     * @param {string} mimetype
     * @return {boolean}
     */
    static decodes(mimetype) {
        return false;
    }

    /**
     * Converts an audio stream to Opus packets
     * @static
     * @param {Stream} stream
     * @param {number} rate - Sample Rate
     * @param {number} channels - Number of channels
     * @param {number} frameDuration
     * @return {Stream} - The Opus stream
     */
    static convert(stream, rate, channels, frameDuration) {
        return null;
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

module.exports = Converter;
