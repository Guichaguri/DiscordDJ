"use strict";

var Discordie = require('discordie');
var DJ = require('./DJ.js');

var createHandler = require('./ChatHandler.js');

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

        this.handler = null;
        this.djs = [];

        this.keys = {
            youtube: null,
            soundcloud: null
        };
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

        this.bot.Dispatcher.once(Discordie.Events.GATEWAY_READY, function(e) {
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

        if(this.handler == null) {
            this.handler = createHandler(this.bot, this);
            this.handler.register();
        }

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
                    var dj = new type(this.bot, info.voiceConnection, this.handler, this.keys);
                    this.djs.push(dj);
                    resolve(dj);
                }.bind(this), reject);
            }

        }.bind(this));
    }

    /**
     * Gets the DJ based on a user server/channel
     * @param user The user object
     * @return DJ
     */
    getFromUser(user) {
        var guild = user.guild_id !== undefined ? user.guild : null;
        var vc = guild != null ? user.getVoiceChannel(guild) : null;

        if(guild != null && vc == null) {
            return null;
        }

        for(var i = 0; i < this.djs.length; i++) {
            var dj = this.djs[i];

            if(dj.voiceConnection === undefined) continue;
            var channel = dj.voiceConnection.channel;
            if(guild != null) {
                if(vc == channel) return dj;
            } else {
                if(dj.voiceConnection == null) continue;
                guild = dj.voiceConnection.guild;
                if(guild == null) continue;
                vc = user.getVoiceChannel(guild);
                if(vc != null && vc == channel) return dj;
            }
        }

        return null;
    }

    /**
     * Destroys a DJ
     * @param dj The DJ object
     * @return boolean Whether the DJ was successfully destroyed
     */
    destroy(dj) {
        var i = this.djs.indexOf(dj);
        if(i != -1) {
            this.djs.splice(index, 1);
            dj.destroy();
            return true;
        }
        return false;
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

    /**
     * Sets a global Youtube key. It will be used in all DJs created by this manager.
     * Note that you have to set it before creating the DJs
     * @param key The Youtube API Key
     */
    setYoutubeKey(key) {
        this.keys.youtube = key;
    }

    /**
     * Sets a global Soundcloud key. It will be used in all DJs created by this manager.
     * Note that you have to set it before creating the DJs
     * @param key The Soundcloud API Key
     */
    setSoundcloudKey(key) {
        this.keys.soundcloud = key;
    }

}

module.exports = DJManager;