"use strict";

const Converter = require('../../interfaces/Converter.js');
const Utils = require('../../Utils.js');
const child_process = require('child_process');

const opusencCmd = Utils.findCommand([
    process.cwd() + '/binary/opusenc',
    'opusenc'
]);

const mimetypes = ['audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/flac',
                    'audio/L16', 'audio/L8', 'audio/L20', 'audio/L24', 'audio/ogg'];

class OpusToolsConverter extends Converter {

    static get available() {
        return opusencCmd != null;
    }

    static converts(mimetype) {
        return mimetypes.includes(mimetype);
    }

    static decodes(mimetype) {
        // Opus Tools can't decode anything to PCM, it can only convert it
        return false;
    }

    static convert(stream, rate, channels, frameDuration) {
        return Utils.createProcess(stream, opusencCmd, [
            '--framesize', frameDuration,
            '--vbr',
            '--raw-rate', rate,
            '--raw-chan', channels,
            '-', '-' // Set input and output to stdin and stdout
        ]);
    }

    static encode(stream, rate, channels, frameDuration) {
        return Utils.createProcess(stream, opusencCmd, [
            '--framesize', frameDuration,
            '--vbr',
            '--raw', // We know it's a PCM stream
            '--raw-rate', rate,
            '--raw-chan', channels,
            '-', '-' // Set input and output to stdin and stdout
        ]);
    }

}

module.exports = OpusToolsConverter;
