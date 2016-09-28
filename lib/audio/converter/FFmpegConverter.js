"use strict";

const Converter = require('../../../interfaces/Converter.js');

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

class FFmpegConverter extends Converter {

    static get available() {
        return ffmpegCmd != null;
    }

    static accepts(mimetype) {
        // FFmpeg decodes so many formats, it's easier to always return true
        return true;
    }

    constructor(rate, channels) {
        this.rate = rate;
        this.channels = channels;
        this.processes = [];
    }

    _createProcess(stream, args) {
        let process = child_process.spawn(ffmpegCmd, args);
        this.processes.push(process);

        stream.pipe(process.stdin);
        return process.stdout;
    }

    convert(stream, frameDuration) {
        // TODO check if this works
        return this._createProcess(stream, [
            "-c:a", "libopus",
            "-frame_duration", frameDuration,
            "-f", "webm", "-"
        ]);
    }

    encode(stream, frameDuration) {
        return this._createProcess(stream, [
            "-c:a", "libopus",
            "-frame_duration", frameDuration,
            "-f", "webm", "-"
        ]);
    }

    decode(stream) {
        return this._createProcess(stream, [
            "-f", "s16le",
            "-ar", this.rate,
            "-ac", this.channels,
            "-af", "volume=1",
            "pipe:1",
            "-i", "-"
        ]);
    }

}

module.exports = FFmpegConverter;
