"use strict";

/**
 * Represents a Playlist.
 * @class
 */
class Playlist extends Array {

    constructor() {
        super();
        this._index = 0;
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

    /** @member {?string} */
    get author() {
        return null;
    }

    /** @member {?string} */
    get description() {
        return null;
    }

    /** @member {?Playable} */
    get currentPlayable() {
        if(this._index >= this.length) return null;
        return this[this._index];
    }

    /**
     * Skips to the next playable
     * @return {boolean} Whether the playlist has reached the end
     */
    skip() {
        return this._index++ >= this.length;
    }

    /**
     * Resets the playlist to the first playable
     */
    reset() {
        this._index = 0;
    }

    /**
     * Shuffles the track order
     */
    shuffle() {
        // TODO
    }

}

module.exports = Playlist;
