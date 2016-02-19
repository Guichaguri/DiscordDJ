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
        yt = new YoutubeVideo(args[1], user);
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
        sc = new SoundcloudAudio(args[1], user);
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
        icy = new IcyAudio(args[1], user);
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
    args.shift(); // Remove first element: the command
    var filename = args.join(' ');
    var f = null;
    try {
        f = new FileAudio(filename, user);
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
        dj.addToQueue(new YoutubeVideo(args[1], user));
    } else if(Utils.SCRegex.test(args[1])) {
        dj.addToQueue(new SoundcloudAudio(args[1], user));
    } else {
        handler.sendPrivateMessage(user, 'Invalid URL');
    }
};

var pmHandler = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(Utils.YTRegex.test(args[0])) {
        dj.addToQueue(new YoutubeVideo(args[0], user));
    } else if(Utils.SCRegex.test(args[0])) {
        dj.addToQueue(new SoundcloudAudio(args[0], user));
    }
};

var queue = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    var q = dj.queue;
    var msg = '';
    if(dj.playable != null) {
        msg += '**Now Playing:** ' + dj.playable.getTitle() + "\n";
        for(var i = 0; i < q.length; i++) {
            msg += "\n" + (i + 1) + '. **' + q[i].getTitle() + '**';
        }
    } else {
        msg += 'The queue is empty';
    }
    handler.sendPrivateMessage(user, msg);
};

module.exports = function(handler) {
    handler.registerCommand('skip', ['skip', 'skp', 'next'], skip, handler.permissions.VOICE_MUTE);
    handler.registerCommand('add', ['add', 'song', 'music', 'set'], add, handler.permissions.VOICE_MUTE);
    handler.registerCommand('youtube', ['youtube', 'yt', 'video'], youtube, handler.permissions.VOICE_MUTE);
    handler.registerCommand('soundcloud', ['soundcloud', 'sc'], soundcloud, handler.permissions.VOICE_MUTE);
    handler.registerCommand('icy', ['icy', 'shoutcast', 'icecast', 'stream'], icy, handler.permissions.VOICE_MUTE);
    handler.registerCommand('file', ['file', 'fs', 'mp3'], file, handler.permissions.VOICE_MUTE);
    handler.registerCommand('queue', ['queue', 'list', 'playing'], queue, null);

    handler.registerCommand('raw-pm', [], pmHandler, handler.permissions.VOICE_MUTE);
};