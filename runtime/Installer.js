var Discordie = require('discordie');
var inviteRegex = /https?:\/\/discord\.gg\/([A-Za-z0-9-]+)\/?/;

function configure(bot, shouldLogin) {

    var rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var disconnected = function() {
        console.log('Login Failed.');
        login();
    };

    function login() {
        rl.question("Email: ", function(email) {
            rl.question("Password: ", function(pass) {
                bot.connect({email: email, password: pass});
            });
        });
    }

    function server() {
        console.log(bot.token);
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
                        var guildId = res.guild.id;
                        var channelId = res.channel.id;
                        //TODO
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
        login();

    } else {

        server();

    }
}

//configure(new Discordie(), true);