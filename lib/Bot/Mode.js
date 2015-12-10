"use strict";

class Mode {

    constructor() {
        this.bot = null;
        this.commands = null;
    }

    init(bot) {
        this.bot = bot;
    }

    addToQueue(playable) {
        return playable;
    }

    getAdditionalInfo() {
        return null;
    }

    onSkip() {

    }

    destroy() {

    }

}

module.exports = Mode;