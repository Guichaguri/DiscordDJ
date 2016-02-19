"use strict";

var InternalDJ = require('./InternalDJ.js');
var EventEmitter = require('events').EventEmitter;

class DJ extends EventEmitter {

    constructor(bot, voiceConnection, handler, keys) {
        super();

        this.dj = new InternalDJ(bot, voiceConnection, this, handler, keys);
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

    get keys() {
        return this.dj.keys;
    }

}

module.exports = DJ;