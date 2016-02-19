"use strict";

var https = require('https');

var Playlist = require('../../Logic/Playlist.js');
var SoundcloudAudio = require('../SoundcloudAudio.js');
var Utils = require('../../Logic/Utils.js');

var errors = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    406: 'Not Accessible',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
};

class SoundcloudPlaylist extends Playlist {

    constructor(url, key) {
        super();

        if(!Utils.SCPlaylistRegex.test(url)) {
            throw new Error("Invalid Playlist URL");
        }

        this.tracks = [];
        this.lastIndex = -1;

        https.get('https://api.soundcloud.com/resolve?url=' + encodeURIComponent(url) +
            '&client_id=' + encodeURIComponent(key), function(res) {
            var loc = res.headers.location;
            https.get(loc, function(ress) {
                if(typeof errors[res.statusCode] != 'undefined') {
                    this.emit('error', new Error(errors[res.statusCode], res.statusCode));
                    return;
                }
                var result = '';
                ress.on('data', function(chunk) {
                    result += chunk;
                });
                ress.on('end', function() {
                    var data = JSON.parse(result);
                    data.tracks.forEach(function(track) {
                        var sc = new SoundcloudAudio(track.permalink_url, key);
                        sc.loadResponse(track);
                        this.tracks.push(sc);
                    }.bind(this));
                    this.emit('update');
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    shuffle() {
        this.shuffleArray(this.tracks);
    }

    getNextSong() {
        if(this.tracks.length == 0) return null;
        this.lastIndex++;
        if(this.lastIndex >= this.tracks.length) {
            this.lastIndex = 0;
        }
        return this.tracks[this.lastIndex];
    }

    hasNextSong() {
        return this.lastIndex < this.tracks.length;
    }

    getLength() {
        return this.tracks.length;
    }

}

module.exports = SoundcloudPlaylist;