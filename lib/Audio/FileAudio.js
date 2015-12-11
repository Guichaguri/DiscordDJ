"use strict";

var fs = require('fs');
var Playable = require("../Logic/Playable.js");

class FileAudio extends Playable {

    constructor(user, file, title) {
        super(user);
        this.file = file;
        this.title = title === undefined ? file : title;
    }

    getTitle() {
        return this.title;
    }

    createStream(callback) {
        callback(fs.createReadStream(this.file));
    }

}

module.exports = FileAudio;