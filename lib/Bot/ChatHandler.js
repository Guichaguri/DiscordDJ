"use strict";

var Utils = require('../Logic/Utils.js');
var registerBasicCommands = require('./Commands.js');

var Discordie = Utils.include('discordie');
var DiscordJS = Utils.include('discord.js');
var DiscordIO = Utils.include('discord.io');

/**
 * A base class to handle chat.
 * This class should be extended to support other libraries and the official Discord API in the future.
 */
class ChatHandler {

    constructor(options) {
        this.options = options;
        this.options.prefixes = this.options.prefixes || ['!', '/'];
        this.options.nowPlayingPrefix = this.options.nowPlayingPrefix || '**Now Playing:** ';
        this.songHistory = {
            channel: null,
            lastMessage: null,
            lastMessageObj: null
        };
        this.commands = {};
    }

    register() {
        registerBasicCommands(this);
    }

    destroy() {

    }

    registerCommand(id, aliases, runnable, defaultPerm) {
        this.commands[id] = {
            alias: aliases,
            run: runnable,
            permission: defaultPerm
        }
    }

    createCommandHandler() {
        return function(obj, authorObj, content, server) {

            var args = content.split(' ');

            var prefixed = false;
            for(var i = 0; i < this.options.prefixes.length; i++) {
                var prefix = this.options.prefixes[i];
                if(args[0].substring(0, prefix.length) == prefix) {
                    args[0] = args[0].substring(prefix.length);
                    prefixed = true;
                    break;
                }
            }

            if(!prefixed && server != null) return false;

            for(var cmd in this.commands) {

                var command = this.commands[cmd];
                if(command.alias.indexOf(args[0]) == -1) continue;
                if(!this.hasPermission(authorObj, command.permission)) {
                    this.sendPrivateMessage(authorObj, "You don't have permission for this command.");
                    return;
                }
                if(server != null) this.deleteMessage(obj);

                command.run(this, obj, authorObj, this.dj, args);
                return;

            }

            if(server == null && this.commands['raw-pm'] != null) {
                this.commands['raw-pm'].run(this, obj, authorObj, this.dj, args);
            }

        }.bind(this);
    }

    updateSongHistory(create) {
        if(this.songHistory.channel == null) return;
        var msg = this.createSongHistoryMessage();
        if(this.songHistory.lastMessage != msg) {

            if(create) {
                if(this.songHistory.lastMessageObj != null) {
                    this.updateMessage(this.songHistory.lastMessageObj, this.songHistory.lastMessage); // Remove prefix
                }
                if(msg != null) {
                    this.sendMessage(this.songHistory.channel, msg).then(function(obj, error) {
                        if(error == null) this.songHistory.lastMessageObj = obj;
                    }.bind(this));
                }
            } else {
                this.updateMessage(this.songHistory.lastMessageObj,
                    (this.dj.playing != null ? this.options.nowPlayingPrefix + "\n" : '') + msg);
            }

            this.songHistory.lastMessage = msg;
        }
    }

    createSongHistoryMessage() {
        if(this.dj.playable == null) return null;
        var additional = this.dj.playable.getAdditionalInfo();
        return this.dj.playable.getTitle() +
            (this.dj.playable.user != null ? "\nDJ: " + this.mention(this.dj.playable.user) : "") +
            (additional != null ? "\n" + additional : "");
    }

    mention(user) {

    }

    sendMessage(channelObj, msg) {

    }

    sendPrivateMessage(authorObj, msg) {

    }

    updateMessage(obj, msg) {

    }

    deleteMessage(obj) {

    }

    hasPermission(authorObj, server, perm) {

    }

    addRole(user, role) {

    }

    removeRole(user, role) {

    }

}

class DiscordieChatHandler extends ChatHandler {

    constructor(bot, options) {
        super(options);
        this.bot = bot;
    }

    register() {
        this.cmdHandler = this.createCommandHandler();
        this.bot.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, this.cmdHandler);
    }

    destroy() {
        this.bot.Dispatcher.removeListener(Discordie.Events.MESSAGE_CREATE, this.cmdHandler);
    }

    createCommandHandler() {
        var cmdHandler = super.createCommandHandler();
        return function(e) {
            cmdHandler(e.message, e.message.author, e.message.content, e.message.channel.guild);
        }.bind(this);
    }

    mention(user) {
        return user.mention;
    }

    sendMessage(channelObj, msg) {
        return channelObj.sendMessage(msg);
    }

    sendPrivateMessage(authorObj, msg) {
        return authorObj.openDM().sendMessage(msg);
    }

    updateMessage(obj, msg) {
        obj.edit(msg);
    }

    deleteMessage(obj) {
        obj.delete();
    }

    hasPermission(authorObj, perm) {
        return authorObj.can(perm, this.dj.voiceConnection.channel);
    }

    addRole(member, role) {
        member.assignRole(role);
    }

    removeRole(member, role) {
        member.unassignRole(role);
    }

}

module.exports = function(bot, options) {

    if(Discordie != null && bot instanceof Discordie) {
        return new DiscordieChatHandler(bot, options);
    } else {
        return null;
    }

};