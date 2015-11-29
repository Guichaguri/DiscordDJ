/*
* This is the run script of the module of a PlugDJ inspired bot
*/

var Discord = require('discord.js');
var DiscordDJ = require("./lib/Bot/DiscordDJ.js");
var ChatHandler = require("./lib/Bot/ChatHandler.js");

function getChat(bot, name) {
    var ch = name;
    if(name instanceof String || typeof name == 'string') {
        bot.channels.forEach(function(channel) {
            if(!(channel instanceof Discord.TextChannel)) return;
            if(channel.id == name || channel.name == name) {
                ch = channel;
            }
        });
    }
    return ch;
}

function getRole(server, name) {
    var rl = name;
    if(name instanceof String || typeof name == 'string') {
        server.roles.forEach(function(role) {
            if(role.id == name || role.name == name) {
                rl = role;
            }
        });
    }
    return rl;
}

var bots = require('./bots.json');

// Add custom command
ChatHandler.commands.djrestart = {
    alias: ["dj-restart", "dj-refresh", "dj-reload"],
    run: function(user, bot, dj, msg, args) {
        if(!ChatHandler.hasPermission("managePermissions", user, bot, msg, false)) {
            ChatHandler.msgNoPerm(user, dj);
            return;
        }
        dj.destroy();
        bot.logout(function() {
            bots = require('./bots.json'); // Reload list
            bots.forEach(function(data) {
                if(data.email == dj._email) {
                    init(data);
                }
            });
        });
    }
};

function init(data) {

    if(data.email.length == 0 || data.password.length == 0 || data.voice.length == 0) {
        console.log("You need to configure bots.json");
        process.exit(-1);
    }

    var bot = new Discord.Client();

    bot.login(data.email, data.password, function(error) {
        if (error != null) {
            console.log(error);
            process.exit(1);
        }
    });

    bot.on("ready", function() {

        // Join voice channel
        var ch = data.voice;
        bot.channels.forEach(function(channel) {
            if(!(channel instanceof Discord.VoiceChannel)) return;
            if(channel.id == data.voice || channel.name == data.voice) {
                ch = channel;
            }
        });
        bot.joinVoiceChannel(ch, function(error) {
            if(error != null) {
                console.log(error);
                process.exit(2);
            }
        });

        // Init bot
        var dj = new DiscordDJ(bot, {
            limit: data.limit,
            djRole: getRole(ch.server, data.djRole),
            listRole: getRole(ch.server, data.listRole)
        }, {
            logChat: getChat(bot, data.logChat),
            nowPlayingPrefix: data.nowPlayingPrefix
        });

        dj._email = data.email;

    });

}

bots.forEach(function(data) {
    init(data);
});
