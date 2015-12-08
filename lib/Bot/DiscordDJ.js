"use strict";
/*
 * This is the default bot implementation of DiscordDJ
 */

var DJ = require('../Logic/DJ.js');
var WaitList = require('./WaitList.js');
var ChatHandler = require("./ChatHandler.js");
var Commands = require('./Commands.js');
var Playlist = require('./Playlist.js').Playlist;

class DiscordDJ extends DJ {

    constructor(bot, mode, chatOpt) {
        super(bot);
        if(mode == null) throw new Error("The mode can't be null");
        this.mode = mode;

        var self = this;
        this.on('skip', function() {
            self.mode.onSkip();
        });

        this.commands = {};
        Commands.registerCommands(this);
        ChatHandler.register(bot, this, chatOpt);

        this.mode.init(this);

        this.roleQueueReady = true;
        this.roleQueue = [];
        this.roleCallback = function(error) {
            self.processRoles();
        };
    }

    destroy() {
        ChatHandler.deregister(this.bot, this);
        this.commands = {};

        this.mode.destroy();
    }

    addToQueue(playable) {
        var p = this.mode.addToQueue(playable);
        if(p != null) super.addToQueue(p);
    }

    registerCommand(id, alias, run) {
        this.commands[id] = {
            alias: alias,
            run: run
        };
    }

    getCommandRunnable(id) {
        return this.commands[id].run;
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