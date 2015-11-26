/*
* This is a PlugDJ inspired bot.
* This file will load bots from the bots.json
*/

var Discord = require('discord.js');

var DJ = require("./Logic/DJ.js");

var YoutubeVideo = require("./Audio/YoutubeVideo.js");
var FileAudio = require("./Audio/FileAudio.js");

var bots = require('./bots.json');

bots.forEach(function(data) {

    var bot = new Discord.Client();
    var dj = new DJ(bot);
    bot.login(data.email, data.password, function (error) {
        if (error != null) {
            console.log(error);
            process.exit(1);
        }
    });

    bot.on("ready", function () {
        dj.joinVoiceChat(data.voice, function(error) {
            if (error != null) {
                console.log(error);
                process.exit(2);
            }
        });
        dj.watchTextChat(data.text);
        dj.logIntoTextChat(data.log);
    });

});
