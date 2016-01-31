"use strict";

var Playable = require('../Logic/Playable.js');
var Utils = require('../Logic/Utils.js');
var youtube = require('ytdl-core');

class YoutubeVideo extends Playable {

    constructor(video, user) {
        super(user);

        if(!Utils.YTRegex.test(video)) {
            throw new Error('Invalid URL');
        }

        this.video = video.replace("https://", "http://"); // YTDL does not recognizes https :(

        this.title = this.video;
        this.url = null;
        this.dataLoaded = false;
    }

    loadData() {
        if(this.dataLoaded) return;
        youtube.getInfo(this.video, function(error, info) {
            if(error != null) {
                console.log('Could not load information from a Youtube video: ' + error);
            } else {
                this.title = info.title;
                this.url = info.loaderUrl;
                this.dataLoaded = true;
                this.emit('data-changed');
            }
        }.bind(this));
    }

    getTitle() {
        return this.title;
    }

    getAdditionalInfo() {
        return '`' + this.url + '`';
    }

    filterVideo(format) {
        return format.container === 'mp4';
    }

    createStream() {
        // Using a new instance of Promise instead of Promise.resolve to catch ytdl-core's crashes
        return new Promise(function(resolve, reject) {
            resolve(youtube(this.video, {filter: this.filterVideo, quality: 'lowest'}));
        }.bind(this));
    }

}

module.exports = YoutubeVideo;