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
            return null;
        }
    }
    return null;
}

var playlistCmd = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(!Utils.exists(dj.mode)) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `playlist url/path`');
        return;
    }
    args.shift(); // Remove first element: the command
    var pl = args.join(' ');

    var playlist = createPlaylist(pl, dj);

    if(playlist == null) {
        handler.sendPrivateMessage(user, 'Invalid Playlist');
    } else {
        dj.mode.addPlaylist(playlist);
        handler.sendPrivateMessage(user, 'Your playlist was added to the queue');
    }
};

class PlaylistMode extends Mode {

    constructor(playlist) {
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
        super.init(bot);

        bot.handler.registerCommand('playlist', ['playlist', 'pl'], playlistCmd, bot.handler.permissions.VOICE_MUTE);

        if(this.playlist != null) {
            bot.play(this.playlist.getNextSong());
        }
    }

    onSkip() {
        try {
            if(this.playlist != null) {
                if(this.playlists.length > 0 && (this.playlist.getLength() <= 0 || !this.playlist.hasNextSong())) {
                    var newPlaylist = this.playlists.shift();
                    this.playlists.push(this.playlist);
                    this.playlist = newPlaylist;
                } else {
                    var song = this.playlist.getNextSong();
                    if(song != null) this.bot.play(song);
                }
            }
        } catch(e) {
            console.log(e);
        }
    }

    addPlaylist(playlist) {
        if(this.playlist == null) {
            this.playlist = playlist;
        } else if(this.playlist.getLength() <= 0) {
            this.playlists.push(this.playlist);
            this.playlist = playlist;
        } else {
            this.playlists.push(playlist);
        }

        //TODO remove
        playlist.on('error', function(err) {
            console.log(err);
        });
    }

    get playlist() {
        return this._playlist;
    }

    set playlist(playlist) {
        if(typeof playlist == 'string') {
            playlist = createPlaylist(playlist, this.bot);
        }
        this._playlist = playlist;
        if(this.bot.playable == null && playlist != null) {
            if(playlist.getLength() <= 0) {
                playlist.once('update', function() {
                    if(playlist != this.playlist) return;
                    var next = playlist.getNextSong();
                    if(next != null) this.bot.play(next);
                }.bind(this));
            } else {
                var next = playlist.getNextSong();
                if(next != null) this.bot.play(next);
            }
        }
    }

}

module.exports = PlaylistMode;