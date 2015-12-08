var FileAudio = require('../Audio/FileAudio.js');
var YoutubeVideo = require('../Audio/YoutubeVideo.js');
var IcyAudio = require('../Audio/IcyAudio.js');

var YTRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(&(amp;)?[\w\?=]*)?/;

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

var skip = function(user, bot, dj, msg, args) {
    if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
        msgNoPerm(user, dj);
        return;
    }
    dj.skip();
};

var youtube = function(user, bot, dj, msg, args) {
    if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
        msgNoPerm(user, dj);
        return;
    }
    if(args.length < 2) {
        dj.sendPM(user, "/" + args[0] + " `youtube video url`");
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
};

var icy = function(user, bot, dj, msg, args) {
    if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
        msgNoPerm(user, dj);
        return;
    }
    var icy = new IcyAudio(user, args[1]);
    dj.addToQueue(icy);
};

var file = function(user, bot, dj, msg, args) {
    if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
        msgNoPerm(user, dj);
        return;
    }
    var file = new FileAudio(user, args[1]);
    dj.addToQueue(file);
};

var shutdown = function(user, bot, dj, msg, args) {
    if(!hasPermission("managePermissions", user, bot, msg, false)) {
        msgNoPerm(user, dj);
        return;
    }
    dj.destroy();
    bot.logout(function() {
        process.exit(1);
    });
};

var help = function(user, bot, dj, msg, args) {
    //TODO

};

var pmHandler = function(user, bot, dj, msg, args) {
    var cmd = null;
    // Handles raw private messages
    if(YTRegex.test(args[0])) {
        // Youtube URL
        cmd = dj.getCommandRunnable('youtube');
        args = ['youtube', args[0]];
    } else {
        cmd = dj.getCommandRunnable('help');
    }
    cmd(user, bot, dj, msg, args);
};

function registerCommands(dj) {
    dj.registerCommand('help', ['dj-help', 'dj-commands', 'dj-cmds'], help);
    dj.registerCommand('skip', ['skip', 'skp', 'next'], skip);
    dj.registerCommand('youtube', ['add', 'youtube', 'addvideo', 'addsong', 'song', 'video'], youtube);
    dj.registerCommand('icy', ['icy', 'shoutcast', 'icecast', 'addstream'], icy);
    dj.registerCommand('file', ['file', 'mp3', 'addfile'], file);

    // Handles raw private messages
    dj.registerCommand('raw-pm', [], pmHandler);

    // Prefixed with "dj-" in case there is other bots in the server
    dj.registerCommand('shutdown', ['dj-shutdown', 'dj-disable'], shutdown);
}

module.exports = {
    hasPermission: hasPermission,
    msgNoPerm: msgNoPerm,
    registerCommands: registerCommands
};