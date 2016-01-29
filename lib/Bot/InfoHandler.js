"use strict";

var IcyAudio = require('../Audio/IcyAudio.js');

class InfoHandler {

    constructor(dj, handler, options) {
        this.dj = dj;
        this.handler = handler;
        this.nowPlayingPrefix = options.nowPlayingPrefix || '**Now Playing:** ';
        this.songHistory = {
            channel: options.songHistoryChannel,
            lastMessage: null,
            lastMessageObj: null
        };
        this.infoMessage = {
            channel: options.infoChannel,
            lastMessage: null,
            lastMessageObj: null
        };

        // Events

        this.onDataChanged = function() {
            this.updateSongHistory(this.dj.nowPlaying instanceof IcyAudio);
            this.updateInfoMessage();
        }.bind(this);

        this.onPlay = function() {
            this.dj.nowPlaying.on('data-changed', this.onDataChanged);
            this.dj.nowPlaying.loadData();

            this.updateSongHistory(true);
            this.updateInfoMessage();
        }.bind(this);

        this.onSkip = function() {
            if(this.dj.nowPlaying == null) {
                this.updateSongHistory(false);
                this.updateInfoMessage();
            }
        }.bind(this);

        this.onInfoUpdate = function() {
            this.updateInfoMessage();
        }.bind(this);

        this.dj.on('play', this.onPlay);
        this.dj.on('skip', this.onSkip);
        this.dj.on('info-update', this.onInfoUpdate);
    }

    destroy() {
        this.dj.removeListener('play', this.onPlay);
        this.dj.removeListener('skip', this.onSkip);
        if(this.dj.nowPlaying != null) {
            this.dj.nowPlaying.removeListener('data-changed', this.onDataChanged);
        }

        if(this.songHistory.lastMessageObj != null) {
            this.handler.deleteMessage(this.songHistory.lastMessageObj);
        }
        if(this.infoMessage.lastMessageObj != null) {
            this.handler.deleteMessage(this.infoMessage.lastMessageObj);
        }
    }

    updateSongHistory(create) {
        if(this.songHistory.channel == null) return;

        var msg = this.createSongHistoryMessage();
        if(this.songHistory.lastMessage != msg) {
            if(msg == null) {
                if(this.songHistory.lastMessage == null) return;
                msg = this.songHistory.lastMessage;
            }

            if(create) {
                if(this.songHistory.lastMessageObj != null) {
                    this.handler.updateMessage(this.songHistory.lastMessageObj, this.songHistory.lastMessage); // Remove prefix
                }
                if(msg != null) {
                    this.handler.sendMessage(this.songHistory.channel, this.nowPlayingPrefix + "\n" + msg).then(function(obj, error) {
                        if(error == null) this.songHistory.lastMessageObj = obj;
                    }.bind(this));
                }
            } else {
                if(this.songHistory.lastMessageObj != null) {
                    this.handler.updateMessage(this.songHistory.lastMessageObj,
                        (this.dj.playing != null ? this.nowPlayingPrefix + "\n" : '') + msg);
                }
            }

            this.songHistory.lastMessage = msg;
        }
    }

    createSongHistoryMessage() {
        if(this.dj.playable == null) return null;
        var additional = this.dj.playable.getAdditionalInfo();
        return this.dj.playable.getTitle() +
            (this.dj.playable.user != null ? "\nDJ: " + this.handler.mention(this.dj.playable.user) : "") +
            (additional != null ? "\n" + additional : "");
    }


    updateInfoMessage() {
        if(this.infoMessage.channel == null) return;

        var msg = this.createInfoMessage();
        if(this.infoMessage.lastMessage != msg) {

            if(this.infoMessage.lastMessageObj == null) {
                this.handler.sendMessage(this.infoMessage.channel, msg).then(function(obj, error) {
                    if(error == null) this.infoMessage.lastMessageObj = obj;
                }.bind(this));
            } else {
                this.handler.updateMessage(this.infoMessage.lastMessageObj, msg);
            }
            this.infoMessage.lastMessage = msg;

        }
    }

    createInfoMessage() {
        var msg = "";

        if(this.dj.nowPlaying != null) {
            msg += this.nowPlayingPrefix + "\n";
            msg += this.dj.nowPlaying.getTitle() + "\n";

            var additional = this.dj.nowPlaying.getAdditionalInfo();
            if(additional != null) msg += additional + "\n";

            if(this.dj.nowPlaying.user != null) {
                msg += "DJ: " + this.handler.mention(this.dj.nowPlaying.user) + "\n";
            }
            msg += "\n";
            if(this.dj.rating != null) {
                msg += "**" + this.dj.rating.likes + "** likes :black_small_square:";
                msg += "**" + this.dj.rating.dislikes + "** dislikes\n";
                msg += "\n";
            }
        } else {
            msg += "";
        }

        var modeInfo = this.dj.mode != null ? this.dj.mode.getAdditionalInfo() : null;
        if(modeInfo != null) {
            msg += modeInfo;
        }

        return msg;
    }

}

module.exports = InfoHandler;