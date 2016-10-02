"use strict";

const Decoder = require('./Decoder.js');
const Encoder = require('./Encoder.js');

/**
 * A converter is an audio decoder and opus encoder at the same time
 * @class
 * @extends Decoder
 * @extends Encoder
 */
class Converter extends Decoder(Encoder) {

    /**
     * Creates a converter
     * @param {number} rate - Sample Rate
     * @param {number} channels - Number of channels
     */
    constructor(rate, channels) {
        super(rate, channels);
    }

    /**
     * Converts an audio stream to Opus packets
     * @param {Stream} stream
     * @param {number} frameDuration
     * @return {Stream} - The Opus stream
     */
    convert(stream, frameDuration) {
        return this.encode(this.decode(stream), frameDuration);
    }

}
