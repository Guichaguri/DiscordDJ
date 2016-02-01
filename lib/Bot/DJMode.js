"use strict";

var Mode = require('./Mode.js');
var Utils = require('../Logic/Utils.js');
var WaitList = require('./WaitList.js');

var joinCmd = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(!Utils.exists(dj.mode)) return;
    if(!Utils.exists(dj.mode.waitlist)) return;

    var r = dj.mode.waitlist.push(user);
    if(r == -1) {
        handler.sendPrivateMessage(user, "You already are in the wait list.");
    } else if(r == -2) {
        handler.sendPrivateMessage(user, "The wait list is full.");
    } else {
        handler.sendPrivateMessage(user, "You joined the wait list! Use `song [url]` to set your song");
    }
};

class DJMode extends Mode {

    constructor(opt) {
        super();
        this.opt = opt;
        this.waitlist = null;
    }

    init(dj) {
        super.init(dj);
        this.waitlist = new WaitList(dj.bot, dj, dj.handler, this.opt['limit'] || 50, this.opt['dj-role'], this.opt['list-role']);

        dj.handler.registerCommand('join', ['join', 'join-waitlist', 'join-wl'], joinCmd, null);

        dj.handler.setCommandPermission('add', null);
        dj.handler.setCommandPermission('youtube', null);
        dj.handler.setCommandPermission('soundcloud', null);
        dj.handler.setCommandPermission('raw-pm', null);
    }

    addToQueue(playable) {
        if(this.waitlist == null) return playable;
        if(playable == null) return null;
        if(playable.user == null) return playable;
        if(this.bot.playable != null && this.bot.playable.user == playable.user) {
            this.bot.handler.sendPrivateMessage(playable.user, "You are the DJ, you can't change your track now");
            return null;
        }
        var r = this.waitlist.push(playable.user, playable, false);
        if(r == -2) {
            this.bot.handler.sendPrivateMessage(playable.user, "The wait list is full");
            return null;
        } else if(r == -1) {
            this.waitlist.setPlayable(playable.user, playable);
            this.bot.handler.sendPrivateMessage(playable.user, "Your song was successfully changed");
        } else if(r == -3) {
            this.bot.handler.sendPrivateMessage(playable.user, "The wait list is locked");
        } else {
            this.bot.handler.sendPrivateMessage(playable.user, "You were added to the wait list and your track was set");
        }
        if(this.bot.playable == null) {
            this.waitlist.processDJList();
        }
        return null;
    }

    getAdditionalInfo() {
        var msg = "";
        var waitlistNotEmpty = this.waitlist.length > 0;
        if(waitlistNotEmpty) msg += "**Wait List**\n";
        var i = 1;
        this.waitlist.forEach(function(entry) {
            msg += i + ". " + entry.user.mention() + "\n";
            i++;
        });
        if(waitlistNotEmpty) msg += "\n";
        if(this.waitlist.isFull()) {
            msg += "**The Wait List is full**";
        } else {
            msg += "Join the Wait List with `add [youtube video url]`";
        }
        return msg;
    }

    onSkip() {
        this.waitlist.processDJList();
    }

    destroy() {
        this.waitlist.destroy();
    }
}

module.exports = DJMode;