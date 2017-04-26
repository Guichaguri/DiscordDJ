"use strict";

const Converter = require('../../interfaces/Converter.js');
const Utils = require('../../Utils.js');
const child_process = require('child_process');

const ffmpegCmd = Utils.findCommand([
    process.cwd() + '/binary/avconv',
    process.cwd() + '/binary/ffmpeg',
    'avconv', 'ffmpeg'
]);

class FFmpegConverter extends Converter {

    static get available() {
        return ffmpegCmd != null;
    }

    static converts(mimetype) {
        // FFmpeg decodes so many formats, it's easier to always return true
        return true;
    }

    static decodes(mimetype) {
        // FFmpeg decodes so many formats, it's easier to always return true
        return true;
    }

    static convert(stream, rate, channels, frameDuration) {
        // Converts directly from raw audio to Opus. Only one process needed
        return Utils.createProcess(stream, ffmpegCmd, [
            '-hide_banner',
    		'-loglevel', 'error',
    		'-i', 'pipe:0',
    		'-map', '0:a',
    		'-acodec', 'libopus',
    		'-f', 'data',
    		'-sample_fmt', 's16',
    		'-vbr', 'off',
    		'-compression_level', '10',
    		'-ar', rate,
    		'-ac', channels,
            '-frame_duration', frameDuration,
    		'-b:a', '128000',
    		'pipe:1'
        ]);
    }

    static encode(stream, rate, channels, frameDuration) {
        return Utils.createProcess(stream, ffmpegCmd, [
            "-c:a", "libopus",
            "-frame_duration", frameDuration,
            "-f", "webm",
            "pipe:1",
            "-i", "-"
        ]);
    }

    static decode(stream, rate, channels) {
        return Utils.createProcess(stream, ffmpegCmd, [
            "-f", "s16le",
            "-ar", rate,
            "-ac", channels,
            "-af", "volume=1",
            "pipe:1",
            "-i", "-"
        ]);
    }

}

module.exports = FFmpegConverter;
