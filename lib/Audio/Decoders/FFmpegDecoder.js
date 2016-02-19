"use strict";

var Decoder = require('../../Logic/Decoder.js');
var child_process = require('child_process');

class FFmpegDecoder extends Decoder {

    constructor(encoderCmd) {
        super();
        this.process = null;
        this.encoderCmd = encoderCmd;
        this.cmdCache = null;
    }

    canDecode(format) {
        return true;
    }

    getCommand() {
        if(this.cmdCache != null) return this.cmdCache;

        var cmds = ["avconv", "ffmpeg", "avconv.exe", "ffmpeg.exe"];
        if(this.encoderCmd != null) {
            cmds.unshift(this.encoderCmd);
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

    createDecoder(stream) {
        var command = this.getCommand();
        if(command == null) {
            console.log('The encoder was not found.');
            this.destroy();
            return null;
        }
        this.process = child_process.spawn(command, [
            "-f", "s16le",
            "-ar", sampleRate,
            "-ac", channels,
            "-af", "volume=1",
            "pipe:1",
            "-i", "-"
        ]);
        stream.pipe(this.process.stdin);
    }

    destroyDecoder() {
        try {
            if(this.process != null) {
                this.process.stdin.pause();
                this.process.kill();
                this.process = null;
            }
        } catch(e) {

        }
    }
}

module.exports = FFmpegDecoder;