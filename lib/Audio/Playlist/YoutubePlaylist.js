"use strict";

var https = require('https');

var Playlist = require('../../Logic/Playlist.js');
var YoutubeVideo = require('../YoutubeVideo.js');
var Utils = require('../../Logic/Utils.js');

class YoutubePlaylist extends Playlist {

    constructor(url, key) {
        super();
        this.lastIndex = -1;
        this.key = key;
        this.id = Utils.YTPlaylistRegex.exec(url);
        if(this.id == null) throw new Error("Invalid Playlist URL");
        this.id = this.id[1];
        this.videos = [];
        this.loadPage(null);
    }

    loadPage(token) {
        var self = this;
        var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50';
        url += '&playlistId=' + this.id + '&key=' + this.key;
        if(token != null) url += '&pageToken=' + token;
        https.get(url, function(res) {
            var body = '';
            res.on('data', function(d) {
                body += d;
            });
            res.on('end', function() {
                var parsed = JSON.parse(body);
                parsed.items.forEach(function(item) {
                    self.videos.push(item.contentDetails.videoId);
                });
                if(typeof parsed.nextPageToken == 'string') {
                    self.loadPage(parsed.nextPageToken);
                }
            });
        }).on('error', function(error) {
            console.log(error);
        });
    }

    shuffle() {
        this.shuffleArray(this.videos);
    }

    getNextSong() {
        if(this.videos.length == 0) return null;
        this.lastIndex++;
        if(this.lastIndex >= this.videos.length) {
            this.lastIndex = 0;
        }
        return new YoutubeVideo(null, 'http://www.youtube.com/watch?v=' + this.videos[this.lastIndex]);
    }

}

module.exports = YoutubePlaylist;