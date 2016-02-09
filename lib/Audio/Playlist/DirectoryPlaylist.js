"use strict";

var fs = require('fs');

var Playlist = require('../../Logic/Playlist.js');
var FileAudio = require('../FileAudio.js');

// Help me add other valid audio extensions here. Video extensions are valid too
var audioExt = ['mp3', 'aac', 'wav', 'ogg', 'aiff', 'mp4', 'avi', 'flv', 'wmv'];

// Playlist that plays audio files from a directory
class DirectoryPlaylist extends Playlist {

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
        this.shuffleArray(this.songList);
    }

    getNextSong() {
        if(this.songList.length == 0) return null;
        this.lastIndex++;
        if(this.lastIndex >= this.songList.length) {
            this.lastIndex = 0;
        }
        return new FileAudio(null, this.songList[this.lastIndex]);
    }

}

module.exports = DirectoryPlaylist;