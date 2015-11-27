/*
* This is a PlugDJ inspired bot.
* This is the run script of the module
*/

var Discord = require('discord.js');

var DJ = require("./lib/Logic/DJ.js");

var YoutubeVideo = require("./lib/Audio/YoutubeVideo.js");
var FileAudio = require("./lib/Audio/FileAudio.js");

var bots = require('./bots.json');

bots.forEach(function(data) {

    if(data.email.length == 0 || data.password.length == 0 || data.voice.length == 0) {
        console.log("You need to configure bots.json");
        process.exit(-1);
    }

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
