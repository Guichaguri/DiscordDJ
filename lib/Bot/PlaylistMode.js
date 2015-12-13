"use strict";

var Mode = require('./Mode.js');

class PlaylistMode extends Mode {

    constructor(playlist) {
        super();
        this.playlist = playlist;
    }

    init(bot) {
        super.init(bot);
        bot.play(this.playlist.getNextSong());
    }

    onSkip() {
        this.bot.play(this.playlist.getNextSong());
    }

}

module.exports = PlaylistMode;