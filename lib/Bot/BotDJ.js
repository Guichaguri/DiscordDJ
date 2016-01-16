"use strict";
/*
 * This is the default bot implementation of DiscordDJ
 */

var DJ = require('../Logic/DJ.js');
var Rating = require('./Rating.js');
var InfoHandler = require('./InfoHandler.js');

class BotDJ extends DJ {

    constructor(bot, voiceConnection, handler) {
        super(bot, voiceConnection, handler);
        this._mode = null;
        this.rating = null;
        this.info = null;

        this.on('skip', function() {
            if(this.rating != null) this.rating.resetRating();
            if(this.mode != null) this.mode.onSkip();
        }.bind(this));
    }

    get mode() {
        return this._mode;
    }

    set mode(mode) {
        if(this._mode != null) this._mode.destroy();
        this._mode = mode;
        if(mode != null) mode.init(this);
    }

    enableRating(options) {
        this.rating = new Rating(bot, this, options);
    }

    disableRating() {
        if(this.rating != null) this.rating.destroy();
        this.rating = null;
    }

    enableInfo(options) {
        this.info = new InfoHandler(this, this.handler, options);
    }

    disableInfo() {
        if(this.info != null) this.info.destroy();
        this.info = null;
    }

    destroy() {
        if(this.info != null) this.info.destroy();
        if(this.rating != null) this.rating.destroy();
        if(this.mode != null) this.mode.destroy();
    }

    addToQueue(playable) {
        var p = this.mode != null ? this.mode.addToQueue(playable) : playable;
        if(p != null) super.addToQueue(p);
    }

}

module.exports = BotDJ;