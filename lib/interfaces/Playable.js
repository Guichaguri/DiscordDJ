"use strict";

const EventEmitter = require('events').EventEmitter;

/**
 * Represents a track/stream link.
 * @class
 */
class Playable extends EventEmitter {

    constructor() {
        super();
        /**
         * Custom Data
         * @member {?object}
         */
        this.data = null;
    }

    /** @member {string} */
    get title() {
        return "Unknown";
    }

    /** @member {string} */
    get artist() {
        return "Unknown";
    }

    /** @member {?string} */
    get description() {
        return null;
    }

    /**
     * Loads playable information
     * @return {Promise}
     */
    loadData() {
        return Promise.reject('Unimplemented function');
        // resolve shouldn't return anything. 'data-changed' should be emitted
    }

    /**
     * Creates a stream
     * @return {Promise}
     */
    createStream() {
        return Promise.reject('Unimplemented function');
        // resolve should return (stream, alreadyDecoded)
    }

}

module.exports = Playable;
