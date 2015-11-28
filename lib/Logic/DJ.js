"use strict";

var InternalDJ = require('./InternalDJ.js');
var EventEmitter = require('events').EventEmitter;

class DJ extends EventEmitter {

    constructor(bot) {
        this.dj = new InternalDJ(bot, this);
    }

    joinVoiceChat(vc, callback) {
        this.dj.joinVoiceChat(vc, callback);
    }

    play(playable) {
        this.dj.play(playable);
    }

    skip() {
        this.dj.skip();
    }

    addToQueue(playable) {
        this.dj.addToQueue(playable);
    }

    get nowPlaying() {
        return this.dj.playable;
    }

    get playable() {
        return this.dj.playable;
    }

    get bot() {
        return this.dj.bot;
    }

}

module.exports = DJ;