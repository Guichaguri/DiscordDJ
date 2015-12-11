var FileAudio = require('../Audio/FileAudio.js');
var YoutubeVideo = require('../Audio/YoutubeVideo.js');
var IcyAudio = require('../Audio/IcyAudio.js');
var SoundcloudAudio = require('../Audio/SoundcloudAudio.js');

var YTRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(&(amp;)?[\w\?=]*)?/;
var SCRegex = /^https?:\/\/(?:www\.)?(?:soundcloud.com|snd.sc)\/(.*)$/;

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

var soundcloud = function(user, bot, dj, msg, args) {
    if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
        msgNoPerm(user, dj);
        return;
    }

    if(args.length < 2) {
        dj.sendPM(user, "/" + args[0] + " `soundcloud track url`");
        return;
    }

    var key = null;
    if(dj.scKey == null) {
        key = args.length > 2 ? args[2] : null;
    } else {
        key = dj.scKey;
    }
    if(key == null) {
        dj.sendPM(user, "No Soundcloud key was set");
        return;
    }

    if(args.length < 2) {
        dj.sendPM(user, "/" + args[0] + " `soundcloud track url`");
        return;
    }
    var sc = new SoundcloudAudio(user, args[1], key);
    dj.addToQueue(sc);
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

var like = function(user, bot, dj, msg, args) {
    dj.rating.like(user);
};
var dislike = function(user, bot, dj, msg, args) {
    dj.rating.dislike(user);
};

var resetRating = function(user, bot, dj, msg, args) {
    if(!hasPermission("voiceMuteMembers", user, bot, msg, true)) {
        msgNoPerm(user, dj);
        return;
    }
    dj.rating.resetRatings();
}

var shutdown = function(user, bot, dj, msg, args) {
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
    dj.registerCommand('skip', ['skip', 'skp', 'next'], skip, 'voiceMuteMembers');
    dj.registerCommand('youtube', ['add', 'youtube', 'addvideo', 'addsong', 'song', 'video'], youtube, 'voiceMuteMembers');
    dj.registerCommand('soundcloud', ['soundcloud', 'sc'], soundcloud, 'voiceMuteMembers');
    dj.registerCommand('icy', ['icy', 'shoutcast', 'icecast', 'addstream'], icy, 'voiceMuteMembers');
    dj.registerCommand('file', ['file', 'mp3', 'addfile'], file, 'voiceMuteMembers');

    dj.registerCommand('like', ['like', 'woot', 'love'], like);
    dj.registerCommand('dislike', ['dislike', 'meh', 'voteskip'], dislike);
    dj.registerCommand('resetVotes', ['resetvotes', 'reset-votes', 'resetrating', 'reset-rating'], resetRating, 'voiceMuteMembers');

    // Handles raw private messages
    dj.registerCommand('raw-pm', [], pmHandler);

    // Prefixed with "dj-" in case there is other bots in the server
    dj.registerCommand('shutdown', ['dj-shutdown', 'dj-disable'], shutdown, 'managePermissions');
}

module.exports = {
    hasPermission: hasPermission,
    msgNoPerm: msgNoPerm,
    registerCommands: registerCommands
};