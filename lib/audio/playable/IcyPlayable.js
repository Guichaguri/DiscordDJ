"use strict";

const Playable = require('../../interfaces/Playable.js');

const icy = require('icy');

class IcyPlayable extends Playable {

    constructor(url) {
        super();
        this.url = url;
    }

    get title() {
        return this._title;
    }

    get artist() {
        return this._artist;
    }

    updateMetadata(metadata) {
        let md = icy.parse(metadata);

        let streamTitle = md['StreamTitle'] || 'Unknown';
        let title = streamTitle.split(' - ', 2);

        if(title.length >= 2) {
            this._artist = title[0];
            this._title = title[1];
        } else {
            this._title = streamTitle;
        }

        this.emit('data-changed');
    }

    loadData() {
        return Promise.reject('Icy only receives data in the stream');
    }

    createStream() {
        return new Promise(function(resolve, reject) {
            icy.get(this.url, function(res) {

                res.on('metadata', this.updateMetadata.bind(this));
                resolve(res, res.headers['Content-Type']);

            }.bind(this));
        }.bind(this));
    }

}

module.exports = IcyPlayable;
