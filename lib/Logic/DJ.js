"use strict";

var Discord = require('discord.js');

var YoutubeVideo = require("../Audio/YoutubeVideo.js");
var FileAudio = require("../Audio/FileAudio.js");

class DJ {

    constructor(bot) {
        this.bot = bot;
        this.playable = null;
        this.musicQueue = [];
        this.textChat = null;
        this.logChat = null;

        this.lastTime = -1;
        this.interval = null;
        this.playingMessage = null;
        this.playingMessageObj = null;

        this.init();
    }

    init() {
        var self = this;
        this.bot.on("message", function(msg) {
            if(msg.author.id == self.bot.user.id) return;
            if(!(msg.channel instanceof Discord.ServerChannel)) return;
            if(self.bot.voiceConnection != null && self.bot.voiceConnection.voiceChannel.server != msg.channel.server) return;
            if(self.textChat == null || msg.channel.id == self.textChat || msg.channel.name == self.textChat) {
                if(msg.content[0] == '/' || msg.content[0] == '!') {
                    var args = msg.content.split(" ");
                    var cmd = args[0].substring(1);
                    if(cmd == 'add') {
                        try {
                            self.addToQueue(new YoutubeVideo(msg.author, args[1]));
                            self.bot.deleteMessage(msg);
                        } catch(e) {
                            console.log("Invalid URL: " + args[1]);
                            console.log(e);
                        }
                    } else if(cmd == 'skip') {
                        var roles = msg.channel.server.rolesOfUser(msg.author);
                        var b = false;
                        roles.forEach(function(role) {
                            if(role.hasPermission("manageMessages")) b = true;
                        });
                        if(!b) return;
                        self.skip();
                        self.bot.deleteMessage(msg);
                    }
                }
            }
        });
    }

    joinVoiceChat(vc, callback) {
        var ch = vc;
        if(vc instanceof String || typeof vc == "string") {
            this.bot.channels.forEach(function(channel) {
                if(!(channel instanceof Discord.VoiceChannel)) return;
                if(channel.id == vc || channel.name == vc) {
                    ch = channel;
                }
            });
        }
        this.bot.joinVoiceChannel(ch, callback);
    }

    watchTextChat(tc) {
        this.textChat = tc;
    }

    logIntoTextChat(tc) {
        var ch = tc;
        if(tc instanceof String || typeof tc == "string") {
            this.bot.channels.forEach(function(channel) {
                if(!(channel instanceof Discord.TextChannel)) return;
                if(channel.id == tc || channel.name == tc) {
                    ch = channel;
                }
            });
        }
        this.logChat = ch;
    }

    play(playable) {
        this.playable = playable;
        this.lastTime = -1;
        var self = this;
        this.bot.voiceConnection.playRawStream(playable.createStream(), function(error, intent) {
            if(error != null) {
                console.log(error);
                console.log("Music skipped");
                self.skip();
            } else {
                self.interval = setInterval(function() {self.update();}, 1000);
                self.createPlayingMessage(playable);
                self.log("**Playing Now:** " + self.playingMessage, function(error, message) {
                    if(error == null) {
                        self.playingMessageObj = message;
                    }
                });
            }
        });
    }

    update() {
        if(this.bot.voiceConnection.streamTime == this.lastTime) {
            clearInterval(this.interval);
            this.skip();
        }
        this.lastTime = this.bot.voiceConnection.streamTime;
    }

    skip() {
        try {
            this.bot.voiceConnection.stopPlaying();
        } catch(e) {

        }
        if(this.playingMessageObj != null) {
            this.bot.updateMessage(this.playingMessageObj, this.playingMessage);
            this.playingMessageObj = null;
            this.playingMessage = null;
        }
        this.playable = null;
        if(this.musicQueue.length > 0) {
            this.play(this.musicQueue.shift());
        }
    }

    createPlayingMessage(playable) {
        var info = playable.getAdditionalInfo();
        self.playingMessage = playable.getTitle() + "\nby " + playable.user.mention() +
                                (info != null ? " " + info : "");
    }

    updatePlayableData() {
        if(this.playable == null) return;
        var oldMsg = this.playingMessage;
        self.createPlayingMessage(this.playable);
        if(this.playingMessage != oldMsg) {
            this.bot.updateMessage(this.playingMessageObj, this.playingMessage);
        }
    }

    addToQueue(playable) {
        playable.loadData(this.updatePlayableData);
        if(this.playable == null) {
            this.play(playable);
        } else {
            this.musicQueue.push(playable);
        }
    }

    log(msg, chatCallback) {
        console.log(msg);
        if(this.logChat != null) {
            this.bot.sendMessage(this.logChat, msg, {}, chatCallback);
        }
    }

}

module.exports = DJ;