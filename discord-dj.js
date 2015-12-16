
var Discord = require('discord.js');

var DiscordDJ = require('./lib/Bot/DiscordDJ.js');
var DJMode = require('./lib/Bot/DJMode.js');
var PlaylistMode = require('./lib/Bot/PlaylistMode.js');

var YoutubePlaylist = require('./lib/Audio/Playlist/YoutubePlaylist.js');
var FilePlaylist = require('./lib/Audio/Playlist/FilePlaylist.js');
var SoundcloudPlaylist = require('./lib/Audio/Playlist/SoundcloudPlaylist.js');
var DirectoryPlaylist = require('./lib/Audio/Playlist/DirectoryPlaylist.js');

var utils = {

    getChat: function(server, name) {
        var ch = name;
        if(name instanceof String || typeof name == 'string') {
            server.channels.forEach(function(channel) {
                if(!(channel instanceof Discord.TextChannel)) return;
                if(channel.id == name || channel.name == name) {
                    ch = channel;
                }
            });
        }
        return ch;
    },

    getVoice: function(server, name) {
        var ch = name;
        if(name instanceof String || typeof name == 'string') {
            server.channels.forEach(function (channel) {
                if (!(channel instanceof Discord.VoiceChannel)) return;
                if (channel.id == name || channel.name == name) {
                    ch = channel;
                }
            });
        }
        return ch;
    },

    getRole: function(server, name) {
        var rl = name;
        if(name instanceof String || typeof name == 'string') {
            server.roles.forEach(function(role) {
                if(role.id == name || role.name == name) {
                    rl = role;
                }
            });
        }
        return rl;
    },

    check: function(val) {
        return (val == null) || (typeof val == 'undefined') || (val.length == 0);
    }
};

var configCommand = function(user, bot, dj, msg, args) {
    if(args.length < 2) {

        var helpMsg = '**Config Help**\n';
        helpMsg += '`config voice [voice channel name]` Changes the music voice channel\n';
        helpMsg += '`config history [text channel name]` Changes the song history text channel. Leave it empty to disable\n';
        helpMsg += '`config info [text channel name]` Changes the informational text channel. Leave it empty to disable\n';
        helpMsg += '`config reload` Reloads the config file.\n';
        dj.sendPM(user, helpMsg);

    } else if(args[1] == 'voice') {

        if(args.length < 3) {
            dj.sendPM('config voice [voice channel name]');
        } else {
            var ch = utils.getVoice(msg.channel.server, args[2]);
            bot.joinVoiceChannel(ch, function(error) {
                if(error != null) {
                    dj.sendPM(user, 'Failed to join voice channel: ' + error);
                } else {
                    //TODO
                }
            });
        }

    } else if(args[1] == 'history') {

    } else if(args[1] == 'info') {

    } else if(args[1] == 'reload') {

    }
};

function checkData(data) {
    var c = false;
    c = c || utils.check(data['email']);
    c = c || utils.check(data['password']);
    c = c || utils.check(data['voice-channel']);
    c = c || utils.check(data['mode']);
    c = c || utils.check(data['mode']['type']);

    return c;
}

function initializeBot(data) {

    if(checkData(data)) {
        console.log('bots.json is not configured!');
        process.exit(1);
    }

    var bot = new Discord.Client();
    var dj = null;

    bot.login(data['email'], data['password'], function(error) {
        if(error != null) {
            console.log(error);
            process.exit(1);
        }
    });

    bot.on('ready', function() {

        var server = null;
        bot.servers.forEach(function(sv) {
            if(sv.id == data['server'] || sv.name == data['server']) {
                server = sv;
            }
        });
        if(server == null) {
            console.log('Server not found');
            process.exit(1);
        }

        var voiceChannel = utils.getVoice(server, data['voice-channel']);
        var songChannel = utils.check(data['song-history']) ? null : utils.getChat(server, data['song-history']);
        var infoChannel = utils.check(data['info-channel']) ? null : utils.getChat(server, data['info-channel']);

        bot.joinVoiceChannel(voiceChannel, function(error) {
            if(error != null) {
                console.log(error);
                process.exit(1);
            }
        });

        var modeData = data['mode'];
        var mode = null;

        switch(modeData['type']) {
            case 'dj':
                mode = new DJMode(modeData['waitlist']);
                break;
            case 'playlist':
                var plData = modeData['playlist'];
                var playlist = null;
                switch(plData['type']) {
                    case 'youtube':
                        playlist = new YoutubePlaylist(plData['key'], plData['url']);
                        break;
                    case 'soundcloud':
                        playlist = new SoundcloudPlaylist(plData['key'], plData['url']);
                        break;
                    case 'file':
                        playlist = new FilePlaylist(plData['path']);
                        break;
                    case 'directory':
                        playlist = new DirectoryPlaylist(plData['path']);
                        break;
                }
                mode = new PlaylistMode(playlist);
                break;
        }

        dj = new DiscordDJ(bot, mode, {
            'song-history': songChannel,
            'info-channel': infoChannel,
            'np-prefix': data['np-prefix']
        });

    });

}

function configureBot(data, bot, dj) {

    //TODO FINISH


    if(dj == null) {

        var rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        function loginQuestion() {
            rl.question("Email: ", function(email) {
                rl.question("Password: ", function(pass) {

                    bot.login(email, pass, function(error) {
                        if(error != null) {
                            console.log("Login failed: " + error);
                            loginQuestion();
                        } else {
                            data['email'] = email;
                            data['password'] = pass;
                            serverQuestion();
                        }
                    });

                });
            });
        }
        function serverQuestion() {
            rl.question("Server Invite Link: ", function(invite) {

                bot.joinServer(invite, function(error, server) {
                    if(error != null) {
                        console.log("Invalid Link: " + error);
                        serverQuestion();
                    } else {
                        data['server'] = server.id;
                        dj = new DiscordDJ();
                        configureBot(data, bot, dj);
                        rl.close();
                    }
                });

            });
        }

        loginQuestion();

    } else {

        dj.deregisterCommands();
        dj.registerCommand('joinvoice', ['join-voice', 'joinvoice', 'joinvc'], function(user, bot, dj, msg, args) {
            if(args.length < 2) {
                dj.sendPM(user, args[0] + ' [voice channel name]');
                return;
            }
            var ch = utils.getVoice(msg.channel.server, args[1]);
            bot.joinVoiceChannel(ch, function(error) {
                if(error != null) {
                    dj.sendPM(user, 'Failed to join voice channel: ' + error);
                } else {
                    dj.deregisterCommands();
                    dj.registerCommands();
                }
            });
        });

        console.log("Hey! I joined the server, but I don't know which voice channel I should stay");
        console.log("Use the command 'joinvoice' to join you in the voice channel");

    }
}