
var Discord = require('discord.js');

var IcyAudio = require('../Audio/IcyAudio.js');

function getServer(msg, bot) {
    if(msg.channel instanceof Discord.ServerChannel) {
        return msg.channel.server;
    } else if(bot.voiceConnection != null) {
        return bot.voiceConnection.voiceChannel.server;
    } else if(bot.servers.length == 1) {
        return bot.servers[0];
    }
    return null;
}

function hasPermission(perm, user, bot, msg, voicePerm) {
    if(bot.voiceConnection != null) {
        if(bot.voiceConnection.voiceChannel.permissionsOf(user).hasPermission(perm)) {
            return true;
        } else if(voicePerm) {
            return false;
        }
    }
    var server = getServer(msg, bot);
    if(server == null) return false;
    var b = false;
    server.roles.forEach(function(role) {
        if(role.hasPermission(perm)) b = true;
    });
    return b;
}

function msgNoPerm(user, dj) {
    dj.sendPM(user, "You don't have permission for this command");
}

function updateNowPlaying(bot, dj, create, logChat, nowPlayingPrefix) {
    if(logChat == null) return;
    var oldMsg = dj.nowPlayingMsg;

    if(dj.nowPlaying != null) {
        var additional = dj.nowPlaying.getAdditionalInfo();
        dj.nowPlayingMsg = dj.nowPlaying.getTitle() +
            (dj.nowPlaying.user != null ? "\nDJ: " + dj.nowPlaying.user : "") +
            (additional != null ? "\n" + additional : "");
    }

    if(create) {
        if(dj.nowPlayingObj != null) {
            bot.updateMessage(dj.nowPlayingObj, oldMsg); // Remove prefix
        }
        if(dj.nowPlaying != null) {
            bot.sendMessage(logChat, nowPlayingPrefix + dj.nowPlayingMsg, {}, function(error, msg) {
                if(error == null) dj.nowPlayingObj = msg;
            });
        }
    } else {
        if(dj.nowPlayingObj != null && dj.nowPlayingMsg != oldMsg)
            bot.updateMessage(dj.nowPlayingObj, (dj.nowPlaying != null ? nowPlayingPrefix : "") + dj.nowPlayingMsg);
    }
}

function updateInfoMessage(bot, dj, infoChat) {
    var msg = "";

    if(dj.nowPlaying != null) {
        msg += "**Now Playing**\n";
        msg += dj.nowPlaying.getTitle() + "\n";

        var additional = dj.nowPlaying.getAdditionalInfo();
        if(additional != null) msg += additional + "\n";

        if(dj.nowPlaying.user != null) {
            msg += "*DJ " + dj.nowPlaying.user.mention() + "*\n";
        }
        msg += "\n";
        if(dj.rating != null) {
            msg += "**" + dj.rating.likes + "** likes :black_small_square: **" + dj.rating.dislikes + "** dislikes\n";
            msg += "\n";
        }
    } else {
        msg += "";
    }

    var modeInfo = dj.mode.getAdditionalInfo();
    if(modeInfo != null) {
        msg += modeInfo;
    }

    dj.infoMsg = msg;

    if(dj.infoObj != null) {
        bot.updateMessage(dj.infoObj, dj.infoMsg); // Remove prefix
    } else {
        bot.sendMessage(infoChat, dj.infoMsg, {}, function(error, msg) {
            if(error == null) dj.infoObj = msg;
        });
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

                if(dj.commands[cmd].permission != null && !hasPermission(dj.commands[cmd].permission, msg.author, bot, msg, false)) {
                    msgNoPerm(msg.author, dj);
                    continue;
                }

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

    var lc = chatOpt['song-history'] instanceof Discord.TextChannel ? chatOpt['song-history'] : null;
    var ic = chatOpt['info-channel'] instanceof Discord.TextChannel ? chatOpt['info-channel'] : null;
    var np = chatOpt['np-prefix'] || "**Now Playing:** ";

    dj.nowPlayingMsg = null;
    dj.nowPlayingObj = null;
    dj.infoMsg = null;
    dj.infoObj = null;

    var dataChanged = function() {
        updateNowPlaying(bot, dj, dj.nowPlaying instanceof IcyAudio, lc, np);
        updateInfoMessage(bot, dj, ic);
    };
    dj.on('play', function() {
        dj.nowPlaying.on('data-changed', dataChanged);
        dj.nowPlaying.loadData();
        updateNowPlaying(bot, dj, true, lc, np);
        updateInfoMessage(bot, dj, ic);
    });
    dj.on('skip', function() {
        if(dj.nowPlaying == null) {
            updateNowPlaying(bot, dj, false, lc, np);
            updateInfoMessage(bot, dj, ic);
        }
    });
    dj.on('info-update', function() {
        updateInfoMessage(bot, dj, ic);
    });
}

function deregister(bot, dj) {
    if(dj.cmdHandler != null) {
        bot.removeListener('message', dj.cmdHandler);
    }
}

module.exports = {
    register: register,
    deregister: deregister,
    createCommandHandler: createCommandHandler
};