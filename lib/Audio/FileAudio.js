"use strict";

var fs = require('fs');
var Playable = require("../Logic/Playable.js");
var Utils = require("../Logic/Utils.js");

class FileAudio extends Playable {

    constructor(file, user, title) {
        super(user);
        this.file = file;
        this.title = title === undefined ? file : title;
    }

    getTitle() {
        return this.title;
    }

    getFormat() {
        return Utils.getExtension(this.file);
    }

    createStream() {
        return new Promise(function(resolve, reject) {
            fs.stat(this.file, function(err, stat) {
                if(err != null) {
                    reject(err);
                } else if(!stat.isFile()) {
                    reject(this.file + ' is not a file');
                } else {
                    resolve(fs.createReadStream(this.file));
                }
            }.bind(this));
        }.bind(this));
    }

}

module.exports = FileAudio;