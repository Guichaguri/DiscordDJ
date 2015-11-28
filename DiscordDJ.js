/*
* This is a PlugDJ inspired bot.
* This is the run script of the module
*/

var Discord = require('discord.js');

var DJ = require("./lib/Logic/DJ.js");

var YoutubeVideo = require("./lib/Audio/YoutubeVideo.js");
var FileAudio = require("./lib/Audio/FileAudio.js");
var IcyAudio = require("./lib/Audio/IcyAudio.js");

var bots = require('./bots.json');

var commands = {
    add: {
        alias: ["add", "addsong", "addvideo", "youtube"],
        run: function(bot, dj, user, msg, args) {
            try {
                dj.addToQueue(new YoutubeVideo(user, args[1]));
                bot.deleteMessage(msg);
            } catch (e) {
                console.log("Invalid URL: " + args[1]);
            }
        }
    },
    skip: {
        alias: ["skip", "stop"],
        run: function(bot, dj, user, msg, args) {
            var roles = msg.channel.server.rolesOfUser(user);
            var b = false;
            roles.forEach(function(role) {
                if(role.hasPermission("manageMessages")) b = true;
            });
            if(!b) return;
            dj.skip();
            bot.deleteMessage(msg);
        }
    }
};

class DiscordDJ {

    constructor(bot) {
        this.bot = bot;
        this.dj = new DJ(bot);

        this.nowPlayingPrefix = "";
        this.watchChat = null;
        this.logChat = null;
        this.playingMessage = null;
        this.playingMessageObj = null;

        var self = this;
        bot.on("message", function(msg) {
            self.onCommand(msg);
        });
        this.dj.on("data-changed", function() {
            self.updatePlayableData();
        });
        this.dj.on("play", function() {
            self.playingMessage = self.createPlayingMessage(self.dj.playable);
            self.log(self.nowPlayingPrefix + self.playingMessage, function(error, message) {
                if(error == null) {
                    self.playingMessageObj = message;
                }
            });
        });
        this.dj.on("skip", function() {
            if(self.playingMessageObj != null) {
                self.bot.updateMessage(this.playingMessageObj, this.playingMessage);
                self.playingMessageObj = null;
                self.playingMessage = null;
            }
        });
    }

    onCommand(msg) {
        if(msg.author.id == this.bot.user.id) return;
        if(!(msg.channel instanceof Discord.ServerChannel)) return;
        if(this.bot.voiceConnection != null && this.bot.voiceConnection.voiceChannel.server != msg.channel.server) return;
        if(this.watchChat == null || msg.channel == this.watchChat) {
            if(msg.content[0] == '/' || msg.content[0] == '!') {
                var args = msg.content.split(" ");
                var label = args[0].substring(1).toLowerCase();
                for(var cmd in commands) {
                    if(commands[cmd].alias.contains(label)) {
                        commands[cmd].run(this.bot, this.dj, msg.author, msg, args);
                        break;
                    }
                }
            }
        }
    }

    watchForChannel(ch) {
        if(ch instanceof String || typeof ch == String) {
            this.bot.channels.forEach(function(channel) {
                if(!(channel instanceof Discord.TextChannel)) return;
                if(channel.id == ch || channel.name == ch) {
                    ch = channel;
                }
            });
        }
        this.watchChat = ch;
    }

    logIntoChannel(ch) {
        if(ch instanceof String || typeof ch == String) {
            this.bot.channels.forEach(function(channel) {
                if(!(channel instanceof Discord.TextChannel)) return;
                if(channel.id == ch || channel.name == ch) {
                    ch = channel;
                }
            });
        }
        this.logChat = ch;
    }

    setMessagePrefix(prefix) {
        this.nowPlayingPrefix = prefix;
    }

    createPlayingMessage(playable) {
        var info = playable.getAdditionalInfo();
        return playable.getTitle() + "\n" + (playable.user != null ? ("by " + playable.user.mention()) : "") +
                (info != null ? " " + info : "");
    }

    updatePlayableData() {
        if(this.playable == null) return;
        if(this.playingMessageObj == null) return;
        var newMsg = this.createPlayingMessage(this.playable);
        if(this.playingMessage != newMsg) {
            if(this.playable instanceof IcyAudio) {
                this.bot.updateMessage(this.playingMessageObj, this.playingMessage); // Remove prefix
                var self = this;
                this.log(this.nowPlayingPrefix + newMsg, function(error, message) {
                    if(error == null) {
                        self.playingMessageObj = message;
                    }
                });
            } else {
                this.bot.updateMessage(this.playingMessageObj, this.nowPlayingPrefix + newMsg);
            }
            this.playingMessage = newMsg;
        }
    }

    log(msg, chatCallback) {
        console.log(msg);
        if(this.logChat != null) {
            this.bot.sendMessage(this.logChat, msg, {}, chatCallback);
        }
    }

}

bots.forEach(function(data) {

    if(data.email.length == 0 || data.password.length == 0 || data.voice.length == 0) {
        console.log("You need to configure bots.json");
        process.exit(-1);
    }

    var bot = new Discord.Client();
    var dj = new DiscordDJ(bot);

    bot.login(data.email, data.password, function (error) {
        if (error != null) {
            console.log(error);
            process.exit(1);
        }
    });

    bot.on("ready", function () {

        // Join Voice Channel
        dj.dj.joinVoiceChat(data.voice, function(error) {
            if(error != null) {
                console.log(error);
                process.exit(2);
            }
        });

        dj.watchForChannel(data.text);
        dj.logIntoChannel(data.log);
        dj.setMessagePrefix(data.prefix || "**Now Playing:** ")

    });

});
