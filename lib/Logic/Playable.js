"use strict";

var EventEmitter = require('events').EventEmitter;

class Playable extends EventEmitter {

    constructor(user) {
        super();
        if(typeof user == 'undefined') user = null;
        this.user = user;
    }

    init(dj) {

    }

    loadData() {
        this.emit('data-changed');
    }

    getTitle() {
        return 'Untitled';
    }

    getAdditionalInfo() {
        return null;
    }

    createStream() {
        return Promise.reject('Invalid Playable');
    }

}

module.exports = Playable;