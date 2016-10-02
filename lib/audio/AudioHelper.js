"use strict";

const stream = require('stream');

const Converter = require('../interfaces/Converter.js');

class AudioHelper {

    /** @private */
    static _selectConverters(discord, mimetype) {
        let decoder = null, encoder = null;

        for(let d of discord.decoders) {
            if(d.available && d.accepts(mimetype)) {
                decoder = d;
                break;
            }
        }
        if(decoder == null) return null; // No Decoder
        if(decoder.prototype instanceof Converter) return decoder; // It's a converter!

        for(let e of discord.encoders) {
            if(e.available) {
                encoder = e;
                break;
            }
        }
        if(encoder == null) return null; // No Encoder

        return [decoder, encoder];
    }

    /** @private */
    static _getStream(stream, resolve, reject) {
        if(stream instanceof stream.Readable) {
            resolve(stream);
        } else if(stream instanceof Promise) {
            stream.then(resolve, reject);
        } else {
            reject("Invalid stream");
        }
    }

    /**
     * Starts buffering a playable
     * @param {Discord} discord
     * @param {Playable} playable
     * @param {object} options
     * @param {number} options.samplerate
     * @param {number} options.channels
     * @param {number} options.frameduration
     * @return {Promise<Stream>}
     */
    static buffer(discord, playable, options) {
        return new Promise(function(resolve, reject) {
            playable.createStream().then(function(stream, mimetype) {

                let converters = this._selectConverters(mimetype);
                if(converters == null) return reject("No Encoder or Decoder was found");

                let samplerate = options['samplerate'] || 48000;
                let channels = options['channels'] || 2;
                let frameduration = options['frameduration'] || 60;

                if(converters instanceof Array) { // It's an array, so we have an encoder and decoder

                    const decoder = new converters[0](samplerate, channels);
                    const encoder = new converters[1](samplerate, channels);
                    this._getStream(decoder.decode(stream), function(pcmStream) {
                        this._getStream(encoder.encode(pcmStream, frameduration), resolve, reject);
                    }.bind(this), reject);

                } else { // It's probably a converter! Let's use it efficiently

                    const converter = new converters(samplerate, channels);
                    this._getStream(converter.convert(stream, frameduration), resolve, reject);

                }
            }.bind(this));
        }.bind(this));
    }

    /**
     * Calculates the sample count
     * @param {object} options
     * @param {number} options.samplerate
     * @param {number} options.frameduration
     * @return {number}
     */
    static getSampleCount(options) {
        let samplerate = options['samplerate'] || 48000;
        let frameduration = options['frameduration'] || 60;

        return samplerate / 1000 * frameduration;
    }

    /**
     * Calculates the read size in bytes
     * @param {object} options
     * @param {number} options.channels
     * @param {number} options.bitdepth
     * @return {number}
     */
    static getReadSize(sampleCount, options) {
        let bitdepth = options['bitdepth'] || 16;
        let channels = options['channels'] || 2;

        return sampleCount * bitdepth / 8 * channels;
    }

}

module.exports = AudioHelper;
