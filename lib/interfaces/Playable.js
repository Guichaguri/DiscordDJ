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

    /** @member {string|Array} */
    get artist() {
        return [];
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
        return Promise.reject('No implementation for this function');
        // resolve shouldn't return anything. 'data-changed' should be emitted
    }

    /**
     * Creates a stream
     * @return {Promise}
     */
    createStream() {
        return Promise.reject('No implementation for this function');
        // resolve should return (stream, mimetype)
        // set the mimetype to "audio/L16", "audio/L8", "audio/L20" or "audio/L24" to skip the decoding process
        // set the mimetype to "audio/opus" to skip the decoding and encoding process
    }

}

module.exports = Playable;
