"use strict";

const Playable = require('../../interfaces/Playable.js');

const fs = require('fs');
const path = require('path');
const mime = require('mime');

const musicmetadata = (function() {
    try {
        return require('musicmetadata');
    } catch(err) {
        return null;
    }
})();

class FilePlayable extends Playable {

    constructor(file) {
        super();
        this.file = file;

        let name = path.basename(file, path.extname(file));
        let title = name.split(' - ', 2);
        this._title = title.length > 1 ? title[1] : name;
        this._artist = title.length > 1 ? title[0] : [];
        this._description = null;
    }

    get title() {
        return this._title;
    }

    get artist() {
        return this._artist;
    }

    get description() {
        return this._description;
    }

    loadData() {
        if(!musicmetadata) return Promise.reject();

        return new Promise(function(resolve, reject) {
            let stream = fs.createReadStream(this.file);

            musicmetadata(stream, function(err, metadata) {
                if(err) return reject(err);

                this._title = metadata.title;
                this._artist = metadata.artist;
                this._description = metadata.album;
                this.emit('data-changed');

                stream.close();
                resolve();

            }.bind(this));
        }.bind(this));
    }

    createStream() {
        try {
            return Promise.resolve(fs.createReadStream(this.file), mime.lookup(this.file));
        } catch(e) {
            return Promise.reject(e);
        }
    }

}

module.exports = FilePlayable;
