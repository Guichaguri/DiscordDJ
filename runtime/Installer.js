var Discordie = require('discordie');
var child_process = require('child_process');

var inviteRegex = /https?:\/\/discord\.gg\/([A-Za-z0-9-]+)\/?/;

module.exports = function(bot, data, shouldLogin, callback) {

    var rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function checkEncoder(callback) {
        var cmds = ["avconv", "ffmpeg", "avconv.exe", "ffmpeg.exe"];
        if(data.encoderPath != null) cmds.unshift(data.encoderPath);
        var encoder = null;

        for(var i = 0; i < cmds.length; i++) {
            var p = child_process.spawnSync(cmds[i]);
            if(!p.error) {
                console.log('Encoder found.');
                encoder = cmds[i];
                break;
            }
        }

        if(encoder == null) {
            console.log('The encoder was not found.');
            console.log('Please, install FFmpeg or Libav');
            console.log('After you have done that, press enter (leaving it blank)');
            console.log('If it still doesn\'t work, paste the executable path (Example: C://ffmpeg/ffmpeg.exe)');
            console.log('If you need help, check the wiki: https://github.com/Guichaguri/DiscordDJ/wiki');
            rl.question("Executable Path: ", function(path) {
                data.encoderPath = path;
                checkEncoder();
            });
        } else {
            callback();
        }
    }

    var disconnected = function() {
        console.log('Login Failed.');
        login();
    };

    function login() {
        rl.question("Email: ", function(email) {
            rl.question("Password: ", function(pass) {
                data.email = email;
                data.password = pass;
                bot.connect({email: email, password: pass});
            });
        });
    }

    function server() {
        data.token = bot.token;

        bot.Dispatcher.removeListener(Discordie.Events.GATEWAY_READY, server);
        bot.Dispatcher.removeListener(Discordie.Events.DISCONNECTED, disconnected);

        rl.question("Voice Channel Invite Link: ", function(link) {
            var code = inviteRegex.exec(link);
            if(code == null) {
                console.log('The invite link is invalid!');
                server();
            } else {
                bot.Invites.accept(code[1]).then(function(res) {
                    if(res.channel.type != 'voice') {
                        console.log('The channel is not a voice channel.');
                        server();
                    } else {
                        data.server = res.guild.id;
                        data.voiceChannel = res.channel.id;
                        rl.close();
                        console.log('Basic information configured! The bot is ready to run now.');
                        callback(data);
                    }
                }, function() {
                    console.log('The invite link was not accepted');
                    server();
                });
            }
        });
    }

    if(shouldLogin) {

        bot.Dispatcher.on(Discordie.Events.GATEWAY_READY, server);
        bot.Dispatcher.on(Discordie.Events.DISCONNECTED, disconnected);
        checkEncoder(login);

    } else {

        checkEncoder(server);

    }
};