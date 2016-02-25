"use strict";

var Decoder = require('../../Logic/Decoder.js');
var child_process = require('child_process');

class FFmpegDecoder extends Decoder {

    constructor(decoderCmd) {
        super();
        this.process = null;
        this.stream = null;
        this.decoderCmd = decoderCmd;
        this.cmdCache = null;
    }

    canDecode(format) {
        // The list is so big that returning true and setting a low priority is better and faster (stronger?)
        return true;
    }

    getCommand() {
        if(this.cmdCache != null) return this.cmdCache;

        var cmds = ["avconv", "ffmpeg", "avconv.exe", "ffmpeg.exe"];
        if(this.decoderCmd != null) {
            cmds.unshift(this.decoderCmd);
        } else {
            cmds.unshift(process.cwd() + '/ffmpeg/ffmpeg');
            cmds.unshift(process.cwd() + '/ffmpeg/ffmpeg.exe');
        }

        for(var i = 0; i < cmds.length; i++){
            var p = child_process.spawnSync(cmds[i]);
            if(!p.error) {
                this.cmdCache = cmds[i];
                return cmds[i];
            }
        }

        return null;
    }

    createDecoder(stream, options) {
        var command = this.getCommand();
        if(command == null) {
            console.log('The decoder was not found.');
            this.kill();
            return null;
        }
        this.stream = stream;
        this.process = child_process.spawn(command, [
            "-f", "s16le",
            "-ar", options.sampleRate,
            "-ac", options.channels,
            "-af", "volume=1",
            "pipe:1",
            "-i", "-"
        ]);
        stream.pipe(this.process.stdin);
        return Promise.resolve(this.process.stdout);
    }

    destroyDecoder() {
        try {
            if(this.process != null) {
                if(this.stream != null) {
                    this.stream.unpipe(this.process.stdin);
                }
                this.process.stdin.pause();
                this.process.kill('SIGKILL');
                this.process = null;
            }
            this.stream = null;
        } catch(e) {

        }
    }

    getPriority() {
        return 500;
    }

}

module.exports = FFmpegDecoder;