"use strict";

var Discordie = require('discordie');
var DJ = require('./DJ.js');

class DJManager {

    /**
     * DJManager constructor
     * @param credentials The credentials (an object with token, email and password) or a Discordie bot instance
     */
    constructor(credentials) {
        if(credentials instanceof Discordie) {
            this.credentials = null;
            this.bot = credentials;
            this.ready = true;
        } else {
            this.credentials = credentials;
            this.bot = null;
            this.ready = false;
        }
    }

    /**
     * This will login using the credentials.
     * The execution of this method is not required
     * @param callback The callback fired when the login is successfully made. Optional
     */
    login(callback) {
        if(this.bot == null && this.credentials != null) {
            this.bot = new Discordie();
            this.bot.connect(this.credentials, true);
            this.credentials = null;
        }

        if(this.ready) {
            callback();
            return;
        }

        this.bot.Dispatcher.on(Discordie.Events.GATEWAY_READY, function(e) {
            this.ready = true;
            if(callback !== undefined) callback();
        }.bind(this));
    }

    /**
     * This will create a new DJ
     * @param voiceChannel The voice channel name/id or a Discordie voice channel instance
     * @param type The class of the DJ. Optional
     * @return Promise
     */
    create(voiceChannel, type) {
        if(voiceChannel == null) throw new Error('The voice channel can not be null');
        if(type === undefined) type = DJ;

        return new Promise(function(resolve, reject) {

            if (this.bot == null || !this.ready) {
                this.login(function() {
                    this.create(voiceChannel, type).then(resolve, reject);
                }.bind(this));
            } else {

                if(voiceChannel instanceof String || typeof voiceChannel == 'string') {
                    voiceChannel = this.getVoiceChannel(voiceChannel, true, true);
                } else if(voiceChannel.join === undefined) {
                    if (voiceChannel.id !== undefined) {
                        voiceChannel = this.getVoiceChannel(voiceChannel.id, true, false);
                    } else {
                        return reject('Invalid Voice Channel');
                    }
                }
                if(voiceChannel == null) return reject('The voice channel was not found');

                voiceChannel.join(false, false).then(function(info) {
                    var dj = new type(this.bot, info.voiceConnection);
                    resolve(dj);
                }.bind(this), reject);
            }

        }.bind(this));
    }

    /**
     * Gets a voice channel instance from a name or id
     * @param str The voice channel name/id
     * @param checkId True to allow str be a voice channel id
     * @param checkName True to allow str be a voice channel name
     * @return IVoiceChannel The Discordie voice channel instance or null
     */
    getVoiceChannel(str, checkId, checkName) {
        var guilds = this.bot.Guilds.toArray();
        for(var i = 0; i < guilds.length; i++) {
            var guild = guilds[i];
            for(var o = 0; o < guild.voiceChannels.length; o++) {
                var vc = guild.voiceChannels[o];

                if(checkId && vc.id == str) {
                    return vc;
                }
                if(checkName && vc.name == str) {
                    return vc;
                }
            }
        }
        return null;
    }

}

module.exports = DJManager;