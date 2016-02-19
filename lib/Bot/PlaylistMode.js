"use strict";

var Mode = require('./Mode.js');
var Utils = require('../Logic/Utils.js');
var fs = require('fs');

var DirectoryPlaylist = require('../Audio/Playlist/DirectoryPlaylist.js');
var FilePlaylist = require('../Audio/Playlist/FilePlaylist.js');
var SoundcloudPlaylist = require('../Audio/Playlist/SoundcloudPlaylist.js');
var YoutubePlaylist = require('../Audio/Playlist/YoutubePlaylist.js');

function createPlaylist(pl, dj) {
    if(Utils.YTPlaylistRegex.test(pl)) {
        return new YoutubePlaylist(pl, dj.keys.youtube);
    } else if(Utils.SCPlaylistRegex.test(pl)) {
        return new SoundcloudPlaylist(pl, dj.keys.soundcloud);
    } else {
        try {
            var stat = fs.statSync(pl);
            if(stat.isFile()) {
                return new FilePlaylist(pl);
            } else {
                return new DirectoryPlaylist(pl);
            }
        } catch(e) {
            console.log(e);
            return null;
        }
    }
    return null;
}

var playlistCmd = function(handler, obj, user, dj, args) {
    console.log('PLAYLIST COMMAND');
    if(dj == null) return;
    if(!Utils.exists(dj.mode)) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `playlist url/path`');
        return;
    }
    args.shift(); // Remove first element: the command
    var pl = args.join(' ');

    var playlist = createPlaylist(pl);

    if(playlist == null) {
        handler.sendPrivateMessage(user, 'Invalid Playlist');
    } else {
        dj.mode.addPlaylist(playlist);
        handler.sendPrivateMessage(user, 'Your playlist was added to the queue');
    }
};

class PlaylistMode extends Mode {

    constructor(playlist) {console.log('PLAYLIST');
        super();
        this._playlist = null;
        this.playlists = [];
        if(playlist instanceof Array) {
            this.playlists = playlist;
            if(this.playlists.length > 0) {
                this._playlist = this.playlists.shift();
            }
        } else if(typeof playlist != 'undefined') {
            this._playlist = playlist;
        }
    }

    init(bot) {
        console.log('PLAYLIST INIT');
        super.init(bot);

        bot.handler.registerCommand('playlist', ['playlist', 'pl'], playlistCmd, bot.handler.permissions.VOICE_MUTE);

        if(this.playlist != null) {
            bot.play(this.playlist.getNextSong());
        }
    }

    onSkip() {
        try {
            if(this.playlist != null) {
                if(this.playlists.length > 0 && !this.playlist.hasNextSong()) {
                    var newPlaylist = this.playlists.shift();
                    this.playlists.push(this.playlist);
                    this.playlist = newPlaylist;
                } else {
                    this.bot.play(this.playlist.getNextSong());
                }
            }
        } catch(e) {
            console.log(e);
        }
    }

    addPlaylist(playlist) {
        if(this.playlist == null) {
            this.playlist = playlist;
        } else {
            this.playlists.push(playlist);
        }
    }

    get playlist() {
        return this._playlist;
    }

    set playlist(playlist) {
        if(typeof playlist == 'string') {
            playlist = createPlaylist(playlist);
        }
        this._playlist = playlist;
        if(this.bot.playable == null && playlist != null) {
            this.bot.play(playlist.getNextSong());
        }
    }

}

module.exports = PlaylistMode;