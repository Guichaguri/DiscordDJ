"use strict";

var fs = require('fs');
var Playable = require("../Logic/Playable.js");

class FileAudio extends Playable {

    constructor(file, user, title) {
        super(user);
        this.file = file;
        this.title = title === undefined ? file : title;
    }

    getTitle() {
        return this.title;
    }

    createStream() {
        // Create a new Promise instance instead of using Promise.resolve to
        // prevent crashes when the file is not readable or does not exist
        return new Promise(function(resolve, reject) {
            resolve(fs.createReadStream(this.file));
        }.bind(this));
    }

}

module.exports = FileAudio;