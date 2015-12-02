"use strict";

var fs = require('fs');
var https = require('https');

var Mode = require('./Mode.js');
var FileAudio = require('../Audio/FileAudio.js');
var YoutubeVideo = require('../Audio/YoutubeVideo.js');
var IcyAudio = require('../Audio/IcyAudio.js');

var audioExt = ['mp3', 'aac', 'wav', 'ogg', 'aiff']; // Help me add other valid audio extensions here

var YTPlaylist = /(?:https?:\/\/)?(?:www\.)?youtube.com\/playlist\?list=([A-Za-z0-9]+)/;

function shuffleArray(array) {
    var counter = array.length, temp, index;
    while(counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

class Playlist extends Mode {

    constructor() {
        super();
    }

    init(bot) {
        super.init(bot);
        bot.play(this.getNextSong());
    }

    onSkip() {
        this.bot.play(this.getNextSong());
    }

    shuffle() {

    }

    getNextSong() {
        return null;
    }

}

class FilePlaylist extends Playlist {

    constructor(folder) {
        super();
        this.lastIndex = -1;
        this.songList = [];
        var files = fs.readdirSync(folder);
        for(var f in files) {
            var filename = files[f];
            if(audioExt.indexOf(filename.substring(filename.lastIndexOf('.') + 1)) == -1) {
                continue;
            }
            this.songList.push(filename);
        }
    }

    shuffle() {
        shuffleArray(this.songList);
    }

    getNextSong() {
        this.lastIndex++;
        if(this.lastIndex >= this.songList.length) {
            this.lastIndex = 0;
        }
        return this.songList[this.lastIndex];
    }

}

class YoutubePlaylist extends Playlist {

    constructor(key, url) {
        super();
        this.lastIndex = -1;
        this.key = key;
        this.id = YTPlaylist.exec(url);
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
        shuffleArray(this.videos);
    }

    getNextSong() {
        this.lastIndex++;
        if(this.lastIndex >= this.videos.length) {
            this.lastIndex = 0;
        }
        return new YoutubeVideo(null, 'http://www.youtube.com/watch?v=' + this.videos[this.lastIndex]);
    }

}

// Not really a playlist, but..
class IcyPlaylist extends Playlist {

    constructor(url) {
        super();
        this.icy = new IcyAudio(null, url);
    }

    getNextSong() {
        return this.icy;
    }

}

module.exports = {
    Playlist: Playlist,
    FilePlaylist: FilePlaylist,
    YoutubePlaylist: YoutubePlaylist,
    IcyPlaylist: IcyPlaylist
};