"use strict";

var Discordie = require('discordie');

class WaitList extends Array {

    constructor(bot, botDj, handler, limit, djRole, listRole) {
        super();

        this.bot = bot;
        this.botDj = botDj;
        this.handler = handler;
        this.limit = limit;
        this.locked = false;
        this.cycle = false;
        this.dj = null;
        this.djRole = djRole;
        this.listRole = listRole;

        this.userUpdate = function(presence) {
            if(presence.member.status == Discordie.StatusTypes.OFFLINE) {
                this.removeUser(presence.member);
            }
        }.bind(this);
        this.bot.Dispatcher.on(Discordie.Events.PRESENCE_UPDATE, this.userUpdate);
    }

    destroy() {
        this.bot.Dispatcher.removeListener(Discordie.Events.PRESENCE_UPDATE, this.userUpdate);

        for(var i = 0; i < this.length; i++) {
            this.handler.removeRole(this[i].user, this.listRole);
        }
        if(this.dj != null) this.handler.removeRole(this.dj.user, this.djRole);
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
            this.handler.removeRole(this.dj.user, this.djRole);
            this.handler.removeRole(this.dj.user, this.listRole);
            if(this.cycle) {
                this.push(this.dj.user);
            }
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
            this.handler.addRole(this.dj.user, this.djRole);
            this.handler.removeRole(this.dj.user, this.listRole);
        } else {
            this.dj = null;
        }
        return this.dj;
    }

    getPlayable(user) {
        for(var i = 0; i < this.length; i++) {
            if(this[i].user.id == user.id) return this[i].music;
        }
        return null;
    }

    setPlayable(user, playable) {
        for(var i = 0; i < this.length; i++) {
            if(this[i].user.id == user.id) {
                this[i].music = playable;
                break;
            }
        }
        if(this.botDj.nowPlaying == null) {
            this.processDJList();
        }
    }

    splice(start, deleteCount, items) {
        var removed = super.splice(start, deleteCount, items);
        for(var i = 0; i < removed.length; i++) {
            this.handler.removeRole(removed[i].user, this.listRole);
        }
    }

    removeUser(user) {
        for(var i = 0; i < this.length; i++) {
            if(this[i].user.id == user.id) {
                super.splice(i, 1);
                break;
            }
        }
        this.handler.removeRole(user, this.listRole);
    }

    push(user, playable, force) {
        if(this.dj != null && this.dj.user.id == user.id) return -1;
        for(var i = 0; i < this.length; i++) {
            if(this[i].user.id == user.id) return -1;
        }

        if(this.isFull() && !force) return -2;
        if(this.locked && !force) return -3;

        if(this.length == 0 && this.dj == null && typeof playable != 'undefined') {
            super.push({
                user: user,
                music: playable
            });
            this.processDJList();
            return 0;
        }

        this.handler.addRole(user, this.listRole);

        var r = super.push({
            user: user,
            music: typeof playable == 'undefined' ? null : playable
        });
        this.botDj.emit('info-update');
        return r;
    }

}

module.exports = WaitList;