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
            ytdl.getInfo(this.url, function(err, info) {
                if(err) return reject(err);

                this.loadInfo(info);
                resolve();

            }.bind(this));
        }.bind(this));
    }

    loadInfo(info) {
        let title = info.title.split(' - ', 2);

        if(title.length >= 2) {
            this._artist = title[0];
            this._title = title[1];
        } else {
            this._title = info.title;
        }

        this._description = info.description;

        this.url = info.loaderUrl;
        this.emit('data-changed');
    }

    filterVideo(format) {
        return format.container === 'mp4' && format.audioEncoding != null;
    }

    createStream() {
        try {
            // Since 2014, video quality does not affect audio quality anymore, so we'll use the lowest quality
            const stream = ytdl(this.url, {filter: this.filterVideo, quality: 'lowest'});
            stream.on('info', this.loadInfo.bind(this));
            return Promise.resolve(stream);
        } catch(e) {
            return Promise.reject(e);
        }
    }

}

module.exports = YouTubePlayable;
