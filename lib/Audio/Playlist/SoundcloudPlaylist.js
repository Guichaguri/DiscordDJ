"use strict";

var https = require('https');

var Playlist = require('../../Logic/Playlist.js');
var SoundcloudAudio = require('../SoundcloudAudio.js');
var Utils = require('../../Logic/Utils.js');

class SoundcloudPlaylist extends Playlist {

    constructor(key, url) {
        super();

        if(!Utils.SCPlaylistRegex.test(url)) {
            throw new Error("Invalid Playlist URL");
        }

        var self = this;
        this.tracks = [];
        this.lastIndex = -1;

        https.get('http://api.soundcloud.com/resolve?url=' + encodeURIComponent(url) +
            '&client_id=' + encodeURIComponent(key), function(res) {
            var loc = res.headers.location;
            https.get(loc, function(ress) {
                var result = '';
                ress.on('data', function(chunk) {
                    result += chunk;
                });
                ress.on('end', function() {
                    var data = JSON.parse(result);
                    data.tracks.forEach(function(track) {
                        var sc = new SoundcloudAudio(null, track.permalink_url, key);
                        sc.loadResponse(track);
                        self.tracks.push(sc);
                    });
                });
            });
        });
    }

    shuffle() {
        this.shuffleArray(this.tracks);
    }

    getNextSong() {
        this.lastIndex++;
        if(this.lastIndex >= this.tracks.length) {
            this.lastIndex = 0;
        }
        return this.tracks[this.lastIndex];
    }

}

module.exports = SoundcloudPlaylist;