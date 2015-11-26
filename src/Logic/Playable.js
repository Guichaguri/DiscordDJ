"use strict";

class Playable {

    constructor(user) {
        this.user = user;
    }

    loadData() {

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