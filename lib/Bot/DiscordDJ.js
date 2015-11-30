"use strict";
/*
 * This is the default implementation of DiscordDJ
 */

var DJ = require('../Logic/DJ.js');
var WaitList = require('./WaitList.js');
var ChatHandler = require("./ChatHandler.js");
var Playlist = require('./Playlist.js').Playlist;

class DiscordDJ extends DJ {

    constructor(bot, waitlistOpt, chatOpt) {
        super(bot);
        var self = this;

        if(waitlistOpt instanceof Playlist) {
            this.playlist = waitlistOpt;
            this.waitlist = null;
            this.on('skip', function() {
                self.play(self.playlist.getNextSong());
            });
        } else {
            this.playlist = null;
            this.waitlist = new WaitList(bot, this, waitlistOpt.limit || 50, waitlistOpt.djRole, waitlistOpt.listRole);
        }
        this.cmdHandler = ChatHandler.register(bot, this, chatOpt.logChat, chatOpt.nowPlayingPrefix);

        this.roleQueueReady = true;
        this.roleQueue = [];
        this.roleCallback = function(error) {
            self.processRoles();
        };
    }

    destroy() {
        ChatHandler.deregister(this.bot, this.cmdHandler);
        if(this.waitlist != null) this.waitlist.destroy();
    }

    addToQueue(playable) {
        if(playable == null) return;
        if(this.waitlist == null) {
            super.addToQueue(playable);
            return;
        }
        if(this.playable != null && this.playable.user == playable.user) {
            this.sendPM(playable.user, "You are the DJ, you can't change your track now");
            return;
        }
        var r = this.waitlist.push(playable.user, playable);
        if(r == -2) {
            this.sendPM(playable.user, "The wait list is full");
            return;
        } else if(r == -1) {
            this.waitlist.setPlayable(playable.user, playable);
            this.sendPM(playable.user, "Your song was successfully changed");
        } else {
            this.sendPM(playable.user, "You were added to the wait list and your track was set");
        }
        if(this.playable == null) {
            this.waitlist.processDJList();
        }
    }

    sendPM(user, msg) {
        this.bot.sendMessage(user, msg);
    }

    addRole(user, role) {
        this.roleQueue.push({
            user: user,
            role: role,
            add: true
        });
        if(this.roleQueueReady) {
            this.processRoles();
        }
    }

    removeRole(user, role) {
        this.roleQueue.push({
            user: user,
            role: role,
            add: false
        });
        if(this.roleQueueReady) {
            this.processRoles();
        }
    }

    processRoles() {
        if(this.roleQueue.length == 0) {
            this.roleQueueReady = true;
            return;
        }
        this.roleQueueReady = false;
        var r = this.roleQueue.shift();
        if(r.add) {
            this.bot.addMemberToRole(r.user, r.role, this.roleCallback);
        } else {
            this.bot.removeMemberFromRole(r.user, r.role, this.roleCallback);
        }
    }

}

module.exports = DiscordDJ;