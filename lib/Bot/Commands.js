var Utils = require('../Logic/Utils.js');

var YoutubeVideo = require('../Audio/YoutubeVideo.js');
var SoundcloudAudio = require('../Audio/SoundcloudAudio.js');
var IcyAudio = require('../Audio/IcyAudio.js');
var FileAudio = require('../Audio/FileAudio.js');

var skip = function(handler, obj, userObj, dj, args) {
    if(dj != null) dj.skip();
};

var youtube = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `youtube video url`');
        return;
    }
    var yt = null;
    try {
        yt = new YoutubeVideo(user, args[1]);
    } catch(e) {
        handler.sendPrivateMessage(user, 'Invalid Song URL');
        return;
    }
    dj.addToQueue(yt);
};

var soundcloud = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `soundcloud track url`');
        return;
    }
    var sc = null;
    try {
        sc = new SoundcloudAudio(user, args[1]);
    } catch(e) {
        handler.sendPrivateMessage(user, 'Invalid Song URL');
        return;
    }
    dj.addToQueue(sc);
};

var icy = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `icy stream url`');
        return;
    }
    var icy = null;
    try {
        icy = new IcyAudio(user, args[1]);
    } catch(e) {
        handler.sendPrivateMessage(user, 'Invalid Song URL');
        return;
    }
    dj.addToQueue(icy);
};

var file = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `file path`');
        return;
    }
    var f = null;
    try {
        f = new FileAudio(user, args[1]);
    } catch(e) {
        handler.sendPrivateMessage(user, 'Invalid Song URL');
        return;
    }
    dj.addToQueue(f);
};

var add = function(handler, obj, user, dj, args) {

    if(dj == null) return;
    if(args.length < 2) {
        handler.sendPrivateMessage(user, '/' + args[0] + ' `url`');
        return;
    }
    if(Utils.YTRegex.test(args[1])) {
        dj.addToQueue(new YoutubeVideo(user, args[1]));
    } else if(Utils.SCRegex.test(args[1])) {
        dj.addToQueue(new SoundcloudAudio(user, args[1]));
    } else {
        handler.sendPrivateMessage(user, 'Invalid URL');
    }
};

var pmHandler = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(Utils.YTRegex.test(args[0])) {
        dj.addToQueue(new YoutubeVideo(user, args[0]));
    } else if(Utils.SCRegex.test(args[0])) {
        dj.addToQueue(new SoundcloudAudio(user, args[0]));
    }
};

module.exports = function(handler) {
    handler.registerCommand('skip', ['skip', 'skp', 'next'], skip, handler.permissions.VOICE_MUTE);
    handler.registerCommand('add', ['add', 'song', 'music', 'set'], add, handler.permissions.VOICE_MUTE);
    handler.registerCommand('youtube', ['youtube', 'yt', 'video'], youtube, handler.permissions.VOICE_MUTE);
    handler.registerCommand('soundcloud', ['soundcloud', 'sc'], soundcloud, handler.permissions.VOICE_MUTE);
    handler.registerCommand('icy', ['icy', 'shoutcast', 'icecast', 'stream'], icy, handler.permissions.VOICE_MUTE);
    handler.registerCommand('file', ['file', 'fs', 'mp3'], file, handler.permissions.VOICE_MUTE);

    handler.registerCommand('raw-pm', [], pmHandler, handler.permissions.VOICE_MUTE);
};