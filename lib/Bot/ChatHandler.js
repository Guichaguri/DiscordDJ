
var Discord = require('discord.js');

var IcyAudio = require('../Audio/IcyAudio.js');

var nowPlayingMsg = null;
var nowPlayingObj = null;

function updateNowPlaying(bot, dj, create, logChat, nowPlayingPrefix) {
    if(logChat == null) return;
    var oldMsg = nowPlayingMsg;

    if(dj.nowPlaying != null) {
        var additional = dj.nowPlaying.getAdditionalInfo();
        nowPlayingMsg = dj.nowPlaying.getTitle() +
            (dj.nowPlaying.user != null ? "\nDJ: " + dj.nowPlaying.user : "") +
            (additional != null ? "\n" + additional : "");
    }

    if(create) {
        if(nowPlayingObj != null) {
            bot.updateMessage(nowPlayingObj, oldMsg); // Remove prefix
        }
        if(dj.nowPlaying != null) {
            bot.sendMessage(logChat, nowPlayingPrefix + nowPlayingMsg, {}, function(error, msg) {
                if(error == null) nowPlayingObj = msg;
            });
        }
    } else {
        if(nowPlayingObj != null && nowPlayingMsg != oldMsg)
            bot.updateMessage(nowPlayingObj, (dj.nowPlaying != null ? nowPlayingPrefix : "") + nowPlayingMsg);
    }
}

function createCommandHandler(bot, dj) {
    return function(msg) {
        if(msg.author.id == bot.user.id) return;

        var server = msg.channel instanceof Discord.ServerChannel;
        var hasSlash = true;
        if(msg.content[0] != '/' && msg.content[0] != '!') {
            if(server) return;
            hasSlash = false;
        }

        var args = msg.content.split(" ");
        var label = args[0].toLowerCase();
        if(hasSlash) label = label.substring(1);

        var commandHandled = false;
        for(var cmd in dj.commands) {
            if(dj.commands[cmd].alias.indexOf(label) != -1) {
                if(server) bot.deleteMessage(msg);
                dj.commands[cmd].run(msg.author, bot, dj, msg, args);
                commandHandled = true;
                break;
            }
        }
        if(!commandHandled && !server && dj.commands['raw-pm'] != null) {
            dj.commands['raw-pm'].run(msg.author, bot, dj, msg, args);
        }
    };
}

function register(bot, dj, chatOpt) {
    dj.cmdHandler = createCommandHandler(bot, dj);
    bot.on('message', dj.cmdHandler);

    var lc = chatOpt.logChat instanceof Discord.TextChannel ? chatOpt.logChat : null;
    var np = chatOpt.nowPlayingPrefix || "**Now Playing:** ";

    dj.on('data-changed', function() {
        updateNowPlaying(bot, dj, dj.nowPlaying instanceof IcyAudio, lc, np);
    });
    dj.on('play', function() {
        updateNowPlaying(bot, dj, true, lc, np);
    });
    dj.on('skip', function() {
        if(dj.nowPlaying == null) updateNowPlaying(bot, dj, false, lc, np);
    });
}

function deregister(bot, dj) {
    if(dj.cmdHandler != null) {
        bot.removeListener('message', dj.cmdHandler);
    }
}

module.exports = {
    register: register,
    deregister: deregister
};