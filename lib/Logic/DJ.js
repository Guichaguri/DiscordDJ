"use strict";

var InternalDJ = require('./InternalDJ.js');
var EventEmitter = require('events').EventEmitter;

class DJ extends EventEmitter {

    constructor(bot, voiceConnection, handler) {
        super();

        this.dj = new InternalDJ(bot, voiceConnection, this, handler);
    }

    destroy() {

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

    get voiceConnection() {
        return this.dj.voiceConnection;
    }

    get handler() {
        return this.dj.handler;
    }

    get multithreaded() {
        return this.dj.multithreaded;
    }

    set multithreaded(b) {
        this.dj.multithreaded = b;
    }

    set encoderCommand(cmd) {
        this.dj.encoderCmd = cmd;
    }

}

module.exports = DJ;