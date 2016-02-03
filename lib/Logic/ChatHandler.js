"use strict";

var Utils = require('./Utils.js');
var registerBasicCommands = require('../Bot/Commands.js');

var Discordie = Utils.include('discordie');
var DiscordJS = Utils.include('discord.js');
var DiscordIO = Utils.include('discord.io');

/**
 * A base class to handle chat.
 * This class should be extended to support other libraries and the official Discord API in the future.
 */
class ChatHandler {

    constructor(manager) {
        this.manager = manager;
        this.commands = {};
        this.prefixes = [];

        this.permissions = {
            MANAGE_PERMISSIONS: null,
            VOICE_MUTE: null
        };
    }

    register() {
        registerBasicCommands(this);
    }

    destroy() {

    }

    addCommandPrefix(prefix) {
        this.prefixes.push(prefix);
    }

    setCommandPermission(id, permission) {
        if(this.commands[id] === undefined) return false;
        this.commands[id].permission = permission;
        return true;
    }

    registerCommand(id, aliases, runnable, defaultPerm) {
        this.commands[id] = {
            alias: aliases,
            run: runnable,
            permission: defaultPerm
        }
    }

    deregisterCommand(id) {
        delete this.commands[id];
    }

    createCommandHandler() {
        return function(obj, authorObj, content, server) {

            var args = content.split(' ');

            var prefixed = false;
            for(var i = 0; i < this.prefixes.length; i++) {
                var prefix = this.prefixes[i];
                if(args[0].substring(0, prefix.length) == prefix) {
                    args[0] = args[0].substring(prefix.length);
                    prefixed = true;
                    break;
                }
            }

            if(!prefixed && server != null) return false;

            for(var cmd in this.commands) {

                var command = this.commands[cmd];
                if(command === undefined) continue;
                if(command.alias.indexOf(args[0]) == -1) continue;

                var dj = this.manager.getFromUser(authorObj);

                if(command.permission != null) {
                    if(dj == null) {
                        return; // Just ignore the message for now
                    } else if(!this.hasPermission(authorObj, command.permission, dj.voiceConnection.channel)) {
                        this.sendPrivateMessage(authorObj, "You don't have permission for this command.");
                        return;
                    }
                }
                if(server != null) this.deleteMessage(obj);

                try {
                    command.run(this, obj, authorObj, dj, args);
                } catch(e) {
                    console.log("A command threw an error (" + args[0] + "): " + e);
                }
                return;

            }

            if(server == null && this.commands['raw-pm'] != null) {
                try {
                    this.commands['raw-pm'].run(this, obj, authorObj, this.manager.getFromUser(authorObj), args);
                } catch(e) {
                    console.log("A command threw an error (raw pm): " + e);
                }
            }

        }.bind(this);
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

    constructor(bot, manager) {
        super(manager);
        this.bot = bot;

        //TODO fix
        this.permissions.MANAGE_PERMISSIONS = 1 << 3;//Discordie.Permissions.General.MANAGE_ROLES;
        this.permissions.VOICE_MUTE = 1 << 22;//Discordie.Permissions.Voice.MUTE_MEMBERS;
    }

    register() {
        super.register();
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
        return authorObj.openDM().then(function(dm) {
            dm.sendMessage(msg);
        });
    }

    updateMessage(obj, msg) {
        obj.edit(msg);
    }

    deleteMessage(obj) {
        obj.delete();
    }

    hasPermission(authorObj, perm, where) {
        return authorObj.can(perm, where);
    }

    addRole(member, role) {
        if(role == null) return;
        member.assignRole(role);
    }

    removeRole(member, role) {
        if(role == null) return;
        member.unassignRole(role);
    }

}

module.exports = function(bot, manager) {

    if(Discordie != null && bot instanceof Discordie) {
        return new DiscordieChatHandler(bot, manager);
    } else {
        return null;
    }

};