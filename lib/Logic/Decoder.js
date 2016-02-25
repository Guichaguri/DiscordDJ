"use strict";

var EventEmitter = require('events').EventEmitter;

class Decoder extends EventEmitter {

    constructor() {
        super();
    }

    canDecode(format) {
        return false;
    }

    createDecoder(stream, options) {
        return Promise.reject('Invalid decoder');
    }

    destroyDecoder() {

    }

    getPriority() {
        return 1000;
    }

    getTitle() {

    }

    getAdditionalInfo() {

    }

}

module.exports = Decoder;