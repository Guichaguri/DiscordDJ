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
        return stream.pipe(new OpusTransformer(rate, channels, frameDuration));
    }

}

/**
 * Opus transformer based on Opusscript and node-opus APIs
 * Thanks to abalabahaha for creating Opusscript and putting this together with the code of this class
 * This class is based on eris' PCMOpusTransformer with a few changes
 */
class OpusTransformer extends Transform {

    constructor(rate, channels, frameDuration) {
        this._opus = new Opus(rate, channels);
        this._framesize = rate * frameDuration / 1000; // 2880
        this._pcmSize = this._framesize * channels * 2; // 11520
    }

    _transform(chunk, encoding, cb) {
        // If there's a remainder, we'll combine it with the chunk
        if(this._remainder) {
            chunk = Buffer.concat([this._remainder, chunk]);
            this._remainder = null;
        }

        // If the chunk size is below the required size, we'll set it as the remainder and wait for more chunks
        if(chunk.length < this._pcmSize) {
            this._remainder = chunk;
            return cb();
        }

        let index = 0;

        // Encodes every frame it can possibly encode
        while(index + this._pcmSize < chunk.length) {
            index += this._pcmSize;
            this.push(this._opus.encode(chunk.slice(index - this._pcmSize, index), this._framesize));
        }

        // Sets the rest of the chunk as the remainder
        if(index < chunk.length) {
            this._remainder = chunk.slice(index);
        }

        cb();
    }

    _flush(cb) {
        // If there is a remainder, we'll encode it even though it's not complete in size
        if(this._remainder) {
            let buf = Buffer.alloc(this._pcmSize, 0);
            this._remainder.copy(buf);
            this.push(this._opus.encode(buf, this._framesize));
            this._remainder = null;
        }

        cb();

        // Cleanup resources
        if(this._opus.delete) {
            this._opus.delete();
        }
    }

}

module.exports = OpusEncoder;
