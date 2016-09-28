"use strict";

const Encoder = require('../../../interfaces/Encoder.js');

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

    constructor(rate, channels) {
        this.rate = rate;
        this.encoder = new Opus(rate, channels);
    }

    encode(buffer, frameDuration) {
        return this.encoder.encode(buffer, this.rate * frameDuration / 1000);
    }

}

module.exports = OpusEncoder;
