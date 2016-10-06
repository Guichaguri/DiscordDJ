"use strict";

const Encoder = require('../../interfaces/Encoder.js');
const Transform = require('stream').Transform;

const Opus = (function() {
    try {
        return require('node-opus').OpusEncoder;
    } catch(e) {
        return require('opusscript');
    }
})();

class OpusEncoder extends Encoder {

    static get available() {
        return true;
    }

    static encode(stream, rate, channels, frameDuration) {
        const framesize = this.rate * frameDuration / 1000;
        const transformer = new Transform();
        const encoder = new Opus(rate, channels);

        transformer._transform = function(chunk, encoding, callback) {
            callback(null, encoder.encode(chunk, framesize));
        };

        return stream.pipe(transformer);
    }

}

module.exports = OpusEncoder;
