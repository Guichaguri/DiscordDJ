"use strict";

var Utils = require('../Logic/Utils.js');

var Discordie = Utils.include('discordie');
var DiscordJS = Utils.include('discord.js');
var DiscordIO = Utils.include('discord.io');

/**
 * A base class to handle the chat.
 * This class should be extended to support other APIs and the official Discord API in the future.
 */
class ChatHandler {

    constructor(dj, options) {
        this.dj = dj;
        this.options = options;
    }

    register() {

    }

    destroy() {

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

            for(var cmd in this.dj.commands) {

                var command = this.dj.commands[cmd];
                if(command.alias.indexOf(label) == -1) continue;
                if(!this.hasPermission(authorObj, command.permission)) {
                    this.sendMessage(authorObj, "You don't have permission for this command.");
                    return;
                }
                if(server != null) this.deleteMessage(obj);

                command.run(this);//TODO
                return;

            }

            if(server == null && dj.commands['raw-pm'] != null) {
                dj.commands['raw-pm'].run(this);//TODO
            }

        }.bind(this);
    }

    sendMessage(authorObj, msg) {

    }

    deleteMessage(obj) {

    }

    hasPermission(authorObj, server, perm) {

    }

}

class DiscordieChatHandler extends ChatHandler {

    constructor(bot, dj, options) {
        super(dj, options);
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
        return function(e) {
            super.createCommandHandler(e.message, e.message.author, e.message.content, e.message.channel.guild);
        }.bind(this);
    }

    sendMessage(authorObj, msg) {
        authorObj.openDM().sendMessage(msg);
    }

    deleteMessage(obj) {
        obj.delete();
    }

    hasPermission(authorObj, perm) {
        return true;
        //return authorObj.can(perm, this.dj.voiceConnection.); TODO
    }

}

module.exports = function(bot, dj, options) {

    if(Discordie != null && bot instanceof Discordie) {
        return new DiscordieChatHandler(bot, dj, options);
    } else {
        return null;
    }

};