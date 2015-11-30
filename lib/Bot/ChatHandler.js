
var Discord = require('discord.js');

var FileAudio = require('../Audio/FileAudio.js');
var YoutubeVideo = require('../Audio/YoutubeVideo.js');
var IcyAudio = require('../Audio/IcyAudio.js');

var YTRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(&(amp;)?[\w\?=]*)?/;

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

var commands = {
    skip: {
        alias: ["skip", "next", "stop"],
        run: function(user, bot, dj, msg, args) {
            if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
                msgNoPerm(user, dj);
                return;
            }
            dj.skip();
        }
    },

    joinWaitlist: {
        alias: ["joinwaitlist", "join"],
        run: function(user, bot, dj, msg, args) {
            var r = dj.waitlist.push(user);
            if(r == -1) {
                dj.sendPM(user, "You already are in the wait list.");
            } else if(r == -2) {
                dj.sendPM(user, "The wait list is full.");
            } else {
                var song = "Use `song [youtube url]` to set your song";
                if(args[1] != "") {
                    try {

                    } catch(e) {}
                }
                dj.sendPM(user, "You joined the wait list! " + song);
            }
        }
    },

    song: {
        alias: ["add", "youtube", "addsong", "addvideo", "song", "video", "setsong", "setvideo"],
        run: function(user, bot, dj, msg, args) {
            if(args.length < 2) {
                dj.sendPM(user, "/" + args[0] + " `youtube video url`");
                return;
            } else if(!YTRegex.test(args[1])) {
                dj.sendPM(user, "Invalid Song URL");
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
        }
    },

    icy: {
        alias: ["shoutcast", "icecast", "icy", "addstream"],
        run: function(user, bot, dj, msg, args) {
            if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
                msgNoPerm(user, dj);
                return;
            }
            var icy = new IcyAudio(user, args[1]);
            dj.addToQueue(icy);
        }
    },

    file: {
        alias: ["file", "mp3", "aac", "addfile"],
        run: function(user, bot, dj, msg, args) {
            if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
                msgNoPerm(user, dj);
                return;
            }
            var file = new FileAudio(user, args[1]);
            dj.addToQueue(file);
        }
    },

    djstop: {
        alias: ["dj-stop", "dj-shutdown", "dj-disable", "dj-quit"], // Prefixed with "dj-" if the server has other bots
        run: function(user, bot, dj, msg, args) {
            if(!hasPermission("managePermissions", user, bot, msg, false)) {
                msgNoPerm(user, dj);
                return;
            }
            dj.destroy();
            bot.logout(function() {
                process.exit(1);
            });
        }
    }
};

function register(bot, dj, lc, np) {
    var handler = function(msg) {
        if(msg.author.id == bot.user.id) return;

        var server = msg.channel instanceof Discord.ServerChannel;
        if(server && msg.content[0] != '/' && msg.content[0] != '!') {
            return;
        }
        var args = msg.content.split(" ");
        var label = args[0].substring(1).toLowerCase();
        var commandHandled = false;
        for(var cmd in commands) {
            if(commands[cmd].alias.indexOf(label) != -1) {
                if(server) bot.deleteMessage(msg);
                commands[cmd].run(msg.author, bot, dj, msg, args);
                commandHandled = true;
                break;
            }
        }
        if(!commandHandled && !server && YTRegex.test(args[0])) {
            args[1] = args[0];
            commands.song.run(msg.author, bot, dj, msg, args);
        }
    };

    lc = lc instanceof Discord.TextChannel ? lc : null;
    np = np || "**Now Playing:** ";

    bot.on('message', handler);
    dj.on('data-changed', function() {
        updateNowPlaying(bot, dj, dj.nowPlaying instanceof IcyAudio, lc, np);
    });
    dj.on('play', function() {
        updateNowPlaying(bot, dj, true, lc, np);
    });
    dj.on('skip', function() {
        if(dj.nowPlaying == null) updateNowPlaying(bot, dj, false, lc, np);
    });

    return handler;
}

function deregister(bot, handler) {
    bot.removeListener('message', handler);
}

module.exports = {
    commands: commands,
    register: register,
    deregister: deregister,

    hasPermission: hasPermission,
    msgNoPerm: msgNoPerm
};