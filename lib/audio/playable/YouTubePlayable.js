"use strict";

const Playable = require('../../interfaces/Playable.js');

const ytdl = require('ytdl-core');

class YouTubePlayable extends Playable {

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

    get description() {
        return this._description;
    }

    loadData() {
        return new Promise(function(resolve, reject) {
            ytdl.getInfo(this.video, function(err, info) {
                if(err) return reject(err);

                let title = info.title.split(' - ', 2);
                this._artist = title[0];
                this._title = title[1];
                this._description = null; //TODO?

                this.url = info.loaderUrl;
                this.emit('data-changed');
                resolve();
            }.bind(this));
        }.bind(this));
    }

    filterVideo(format) {
        return format.container === 'mp4';
    }

    createStream() {
        try {
            // Since 2014, video quality does not affect audio quality anymore, so we'll use the lowest quality
            return Promise.resolve(ytdl(this.url, {filter: this.filterVideo, quality: 'lowest'}));
        } catch(e) {
            return Promise.reject(e);
        }
    }

}

module.exports = YouTubePlayable;
