"use strict";

var Discord = require('discord.js');

class WaitList extends Array {

    constructor(bot, botDj, limit, djRole, listRole) {
        super();

        this.bot = bot;
        this.botDj = botDj;
        this.limit = limit;
        this.dj = null;
        this.djRole = djRole instanceof Discord.Role ? djRole : null;
        this.listRole = listRole instanceof Discord.Role ? listRole : null;

        var self = this;
        this.userUpdate = function(user, status, gameId) {
            if(status == 'offline') {
                self.removeUser(user);
            }
        };
        bot.on('presence', this.userUpdate);
    }

    destroy() {
        this.bot.removeListener('presence', this.userUpdate);

        var self = this;
        this.forEach(function(u) {
            self.botDj.removeRole(u.user, self.listRole);
        });
        if(this.dj != null) this.botDj.removeRole(this.dj.user, this.djRole);
        this.dj = null;
        this.splice(0, this.length);
    }

    processDJList() {
        if(this.length == 0) {
            this.removeDJ();
            return;
        }
        var dj = this[0];
        for(var i = 0; i < this.length; i++) {
            if(dj.music != null) break;
            super.push(super.shift());
            dj = this[0];
        }
        if(dj.music == null) {
            this.removeDJ();
            return;
        }
        dj = this.shift();
        this.botDj.play(dj.music);
    }

    removeDJ() {
        if(this.dj != null) {
            this.botDj.removeRole(this.dj.user, this.djRole);
            this.botDj.removeRole(this.dj.user, this.listRole);
            this.dj = null;
        }
    }

    isFull() {
        return this.length >= this.limit;
    }

    getCurrentDJ() {
        return this.dj.user;
    }

    shift() {
        this.removeDJ();
        if(this.length > 0) {
            this.dj = super.shift();
            this.botDj.addRole(this.dj.user, this.djRole);
            this.botDj.removeRole(this.dj.user, this.listRole);
        } else {
            this.dj = null;
        }
        return this.dj;
    }

    getPlayable(user) {
        var playable = null;
        this.forEach(function(u) {
            if(u.user.id == user.id) playable = u.music;
        });
        return playable;
    }

    setPlayable(user, playable) {
        this.forEach(function(u) {
            if(u.user.id == user.id) {
                u.music = playable;
            }
        });
        if(this.botDj.nowPlaying == null) {
            this.processDJList();
        }
    }

    splice(start, deleteCount, items) {
        var removed = super.splice(start, deleteCount, items);
        removed.forEach(function(r) {
            this.botDj.removeRole(r.user, this.listRole);
        });
    }

    removeUser(user) {
        for(var i = 0; i < this.length; i++) {
            if(this[i].user.id == user.id) {
                super.splice(i, 1);
                break;
            }
        }
        this.botDj.removeRole(user, this.listRole);
    }

    push(user, playable) {
        if(this.dj != null && this.dj.user == user) return -1;
        var b = false;
        this.forEach(function(u) {
            if(u.user == user) b = true;
        });
        if(b) return -1;
        if(this.isFull()) return -2;
        if(this.length == 0 && this.dj == null && typeof playable != 'undefined') {
            super.push({
                user: user,
                music: playable
            });
            this.processDJList();
            return 0;
        }

        this.botDj.addRole(user, this.listRole);

        var r = super.push({
            user: user,
            music: typeof playable == 'undefined' ? null : playable
        });
        this.botDj.emit('info-update');
        return r;
    }

}

module.exports = WaitList;