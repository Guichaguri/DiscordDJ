"use strict";

const Playable = require('../../interfaces/Playable.js');

const fs = require('fs');

class FilePlayable extends Playable {

    constructor(path) {
        super();
        this.path = path;
    }

    get title() {
        return this._title;//TODO?
    }

    get artist() {
        return this._artist;//TODO?
    }

    get description() {
        return this._description;//TODO?
    }

    loadData() {
        return Promise.resolve(); //TODO?
    }

    createStream() {
        try {
            return Promise.resolve(fs.createReadStream(this.path));
        } catch(e) {
            return Promise.reject(e);
        }
    }

}

module.exports = FilePlayable;
