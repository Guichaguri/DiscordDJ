"use strict";

var Mode = require('./Mode.js');
var WaitList = require('./WaitList.js');
var YoutubeVideo = require('../Audio/YoutubeVideo.js');

var joinCmd = function(user, bot, dj, msg, args) {
    var r = dj.mode.waitlist.push(user);
    if(r == -1) {
        dj.sendPM(user, "You already are in the wait list.");
    } else if(r == -2) {
        dj.sendPM(user, "The wait list is full.");
    } else {
        dj.sendPM(user, "You joined the wait list! Use `song [youtube url]` to set your song");
    }
};

// Replacement for the original command.
// It's pretty similar, but it does not requires any special permission
var youtubeCmd = function(user, bot, dj, msg, args) {
    if(args.length < 2) {
        dj.sendPM(user, "/" + args[0] + " `youtube video url`");
        return;
    }
    var add = true, yt = null;
    try {
        yt = new YoutubeVideo(user, args[1]);
    } catch(e) {
        dj.sendPM(user, "Invalid Song URL");
        add = false;
    }
    if(add) {
        dj.addToQueue(yt);
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
        this.waitlist = new WaitList(dj.bot, dj, this.opt.limit || 50, this.opt.djRole, this.opt.listRole);

        dj.registerCommand('join', ['join', 'join-waitlist', 'join-wl'], joinCmd);
        dj.registerCommand('youtube', ['add', 'youtube', 'addvideo', 'addsong', 'song', 'video',
                                       'setsong', 'setvideo'], youtubeCmd);
    }

    addToQueue(playable) {
        if(this.waitlist == null) return playable;
        if(playable == null) return null;
        if(this.bot.playable != null && this.bot.playable.user == playable.user) {
            this.bot.sendPM(playable.user, "You are the DJ, you can't change your track now");
            return null;
        }
        var r = this.waitlist.push(playable.user, playable);
        if(r == -2) {
            this.bot.sendPM(playable.user, "The wait list is full");
            return null;
        } else if(r == -1) {
            this.waitlist.setPlayable(playable.user, playable);
            this.bot.sendPM(playable.user, "Your song was successfully changed");
        } else {
            this.bot.sendPM(playable.user, "You were added to the wait list and your track was set");
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