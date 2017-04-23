"use strict";

const Converter = require('../../interfaces/Converter.js');
const child_process = require('child_process');

const ffmpegCmd = (function() {
    var cmds = ['avconv', 'ffmpeg', 'avconv.exe', 'ffmpeg.exe'];
    cmds.unshift(process.cwd() + '/ffmpeg/ffmpeg');
    cmds.unshift(process.cwd() + '/ffmpeg/ffmpeg.exe');

    for(var i = 0; i < cmds.length; i++){
        var p = child_process.spawnSync(cmds[i]);
        if(!p.error) return cmds[i];
    }
    return null;
})();

const processes = [];

class FFmpegConverter extends Converter {

    static get available() {
        return ffmpegCmd != null;
    }

    static accepts(mimetype) {
        // FFmpeg decodes so many formats, it's easier to always return true
        return true;
    }

    static _createProcess(stream, args) {
        const process = child_process.spawn(ffmpegCmd, args);
        processes.push(process);

        stream.pipe(process.stdin);
        return process.stdout;
    }

    static convert(stream, rate, channels, frameDuration) {
        // Converts directly from raw audio to Opus. Only one process needed
        return FFmpegConverter._createProcess(stream, [
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
        return FFmpegConverter._createProcess(stream, [
            "-c:a", "libopus",
            "-frame_duration", frameDuration,
            "-f", "webm",
            "pipe:1",
            "-i", "-"
        ]);
    }

    static decode(stream, rate, channels) {
        return FFmpegConverter._createProcess(stream, [
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
