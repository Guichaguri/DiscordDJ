"use strict";

var EventEmitter = require('events').EventEmitter;

class Decoder extends EventEmitter {

    constructor() {
        super();
    }

    canDecode(format) {
        return false;
    }

    createDecoder(stream) {
        return Promise.reject('Invalid decoder');
    }

    destroyDecoder() {

    }

    getTitle() {

    }

    getAdditionalInfo() {

    }

}

module.exports = Decoder;