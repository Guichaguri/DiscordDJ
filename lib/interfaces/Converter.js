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

}

Utils.copyProperties(Converter, Decoder);
Utils.copyProperties(Converter.prototype, Decoder.prototype);

Utils.copyProperties(Converter, Encoder);
Utils.copyProperties(Converter.prototype, Encoder.prototype);

module.exports = Converter;
