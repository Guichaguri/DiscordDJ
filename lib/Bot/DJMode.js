"use strict";

var Mode = require('./Mode.js');
var WaitList = require('./WaitList.js');

class DJMode extends Mode {

    constructor(opt) {
        super();
        this.opt = opt;
        this.waitlist = null;
    }

    init(bot) {
        super.init(bot);
        this.waitlist = new WaitList(bot, this, this.opt.limit || 50, this.opt.djRole, this.opt.listRole)
    }

    addToQueue(playable) {
        if(this.waitlist == null) return playable;
        if(playable == null) return null;
        if(this.bot.playable != null && this.bot.playable.user == playable.user) {
            this.sendPM(playable.user, "You are the DJ, you can't change your track now");
            return null;
        }
        var r = this.waitlist.push(playable.user, playable);
        if(r == -2) {
            this.sendPM(playable.user, "The wait list is full");
            return null;
        } else if(r == -1) {
            this.waitlist.setPlayable(playable.user, playable);
            this.sendPM(playable.user, "Your song was successfully changed");
        } else {
            this.sendPM(playable.user, "You were added to the wait list and your track was set");
        }
        if(this.playable == null) {
            this.waitlist.processDJList();
        }
        return null;
    }

    onSkip() {
        this.waitlist.processDJList();
    }

    destroy() {
        this.waitlist.destroy();
    }
}