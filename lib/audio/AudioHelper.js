"use strict";

const stream = require('stream');

const Converter = require('../interfaces/Converter.js');
const Utils = require('../Utils.js');

class AudioHelper {

    /** @private */
    static _selectConverters(discord, mimetype) {
        let decoder = null, encoder = null;

        // Find a decoder or converter
        for(let d of discord.decoders) {
            if(!d.available) continue;

            if(d.prototype instanceof Converter && d.converts(mimetype)) {
                return d; // It's a converter!
            }

            if(d.decodes(mimetype)) {
                decoder = d;
                break;
            }
        }
        if(decoder == null) return null; // No Decoder

        // Find an encoder
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
        if(Utils.isStream(stream)) {
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

                const converters = AudioHelper._selectConverters(discord, mimetype);
                if(converters == null) return reject("No Encoder or Decoder was found");

                const samplerate = options['samplerate'] || 48000;
                const channels = options['channels'] || 2;
                const frameduration = options['frameduration'] || 60;

                if(converters instanceof Array) { // It's an array, so we have an encoder and decoder

                    AudioHelper._getStream(converters[0].decode(stream, samplerate, channels), function(pcmStream) {
                        AudioHelper._getStream(converters[1].encode(pcmStream, samplerate, channels, frameduration), resolve, reject);
                    }, reject);

                } else { // It's probably a converter! Let's use it efficiently

                    AudioHelper._getStream(converters.convert(stream, samplerate, channels, frameduration), resolve, reject);

                }
            }, reject);
        });
    }

    /**
     * Calculates the sample count from an opus format
     * @param {object} options
     * @param {number} options.samplerate
     * @param {number} options.frameduration
     * @return {number}
     */
    static getSampleCount(options) {
        const samplerate = options['samplerate'] || 48000;
        const frameduration = options['frameduration'] || 60;

        return samplerate / 1000 * frameduration;
    }

    /**
     * Calculates the read size in bytes per second from an opus format
     * @param {object} options
     * @param {number} options.frameduration
     * @return {number}
     */
    static getReadSize(options) {
        const frameduration = options['frameduration'] || 60;

        return 16 * frameduration; // (128 * frameduration) / 8
    }

}

module.exports = AudioHelper;
