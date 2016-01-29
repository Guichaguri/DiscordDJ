"use strict";

var Playable = require('../Logic/Playable.js');
var Utils = require('../Logic/Utils.js');
var youtube = require('ytdl-core');

class YoutubeVideo extends Playable {

    constructor(user, video) {
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
        var self = this;
        youtube.getInfo(this.video, function(error, info) {
            if(error != null) {
                console.log(error);
            } else {
                self.title = info.title;
                self.url = info.loaderUrl;
                self.dataLoaded = true;
                self.emit('data-changed');
            }
        });
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

    createStream(callback) {
        callback(youtube(this.video, {filter: this.filterVideo, quality: 'lowest'}));
    }

}

module.exports = YoutubeVideo;