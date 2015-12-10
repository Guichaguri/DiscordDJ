"use strict";

class InternalDJ {

    constructor(bot, wrapper) {
        this.bot = bot;
        this.wrapper = wrapper;
        this.playable = null;
        this.musicQueue = [];
        this.lastTime = -1;
        this.interval = null;
    }

    play(playable) {
        this.playable = playable;
        this.lastTime = -1;
        var self = this;
        var streamStarted = false;
        var tm = setTimeout(function() {
            if(!streamStarted) self.skip();
            streamStarted = true;
        }, 5000); // 5 sec
        playable.createStream(function(stream) {
            if(streamStarted) return;
            streamStarted = true;
            clearTimeout(tm);
            if(stream == null) self.skip();
            self.bot.voiceConnection.playRawStream(stream, function(error) {
                if(error != null) {
                    console.log(error);
                    self.skip();
                } else {
                    self.interval = setInterval(function() {self.update();}, 1000);
                    self.wrapper.emit('play');
                }
            });
        });
    }

    update() {
        if(this.bot.voiceConnection.streamTime == this.lastTime) {
            clearInterval(this.interval);
            this.skip();
        }
        this.lastTime = this.bot.voiceConnection.streamTime;
    }

    skip() {
        try {
            this.bot.voiceConnection.stopPlaying();
        } catch(e) {}
        if(this.playable != null) {
            this.playable.removeAllListeners('data-changed');
            this.playable = null;
        }
        this.wrapper.emit('skip');
        if(this.playable == null && this.musicQueue.length > 0) {
            this.play(this.musicQueue.shift());
        }
    }

    addToQueue(playable) {
        var self = this;
        playable.on('data-changed', function() {
            self.wrapper.emit('data-changed');
        });
        playable.loadData();
        if(this.playable == null) {
            this.play(playable);
        } else {
            this.musicQueue.push(playable);
        }
    }

}

module.exports = InternalDJ;