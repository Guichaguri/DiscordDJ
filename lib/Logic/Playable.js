"use strict";

class Playable {

    constructor(user) {
        this.user = user;
    }

    loadData(callback) {
        callback();
    }

    getTitle() {
        return "";
    }

    getAdditionalInfo() {
        return null;
    }

    createStream() {
        return null;
    }

}

module.exports = Playable;