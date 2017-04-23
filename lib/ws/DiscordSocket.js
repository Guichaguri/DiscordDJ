"use strict";

const urlutils = require('url');
const pako = require('pako');

const APISocket = require('./APISocket.js');
const Constants = require('../Constants.js');
const Utils = require('../Utils.js');

class DiscordSocket extends APISocket {
    constructor(url, discord, compress) {
        super(url);
        this.discord = discord; // Discord instance
        this.compress = compress; // Compress
        this.sessionId = null; // Session ID
        this.userId = null; // User ID
        this.seq = 0; // Sequence number
    }

    send(op, data) {
        super.send(JSON.stringify({op: op, d: data}));
    }

    sendHeartbeat() {
        if(!this.heartbeaten) {
            console.log('NO DISCORD CONNECTION!');
            return; // TODO
        }
        this.send(Constants.OP_HEARTBEAT, this.seq);
        this.heartbeaten = false;
    }

    connectVoice(guildId, channelId) {
        this.send(Constants.OP_VOICE_STATE_UPDATE, {
            guild_id: guildId,
            channel_id: channelId,
            self_mute: false,
            self_deaf: false
        });
    }

    handleHello(data) {
        this.send(Constants.OP_IDENTITY, {
            token: this.discord.token,
            properties: {
                '$browser': 'DiscordDJ',
                '$device': 'DiscordDJ'
            },
            compress: this.compress, // TODO use compression
            large_threshold: 50, // TODO leave it as is?
            shard: [this.discord._currentShard, this.discord._totalShards]
        });

        this.hearbeatInterval = data['heartbeat_interval'];
        this.startHeartbeating();
    }

    handleEvents(seq, type, data) {
        if(seq && this.sessionId) {
            this.seq = seq;
        }

        switch(type) {
            case Constants.EVENT_READY:
                this.sessionId = data['session_id'];
                this.userId = data['user']['id'];
                this.discord.emit('ready');
                break;
            case Constants.EVENT_VOICE_SERVER_UPDATE:
                var djs = this.discord.djs;
                for(var i = 0; i < djs.length; i++) {
                    if(djs[i].guildId == data['guild_id']) {
                        djs[i].emit('update-connection', data['token'], data['endpoint']);
                        break;
                    }
                }
                break;
            default:
                console.log('Event:', type);
                break;
        }
    }

    handleMessage(data, flags) {
        if(this.compress && (data instanceof Buffer || data instanceof ArrayBuffer)) {
            data = pako.inflate(data, {to: "string"});
        }

        var json = JSON.parse(data);
        switch(json['op']) {
            case Constants.OP_DISPATCH:
                this.handleEvents(json['s'], json['t'], json['d']);
                break;
            case Constants.OP_HEARTBEAT_ACK:
                this.heartbeaten = true;
                break;
            case Constants.OP_HELLO:
                this.handleHello(json['d']);
                break;
            default:
                console.log('Unknown OP code:', json['op']);
                break;
        }
    }

}

DiscordSocket.retrieveGatewayURL = function() {
    return new Promise(function(resolve, reject) {
        Utils.request('https://discordapp.com/api/gateway', 'GET').then(function(result) {
            resolve(JSON.parse(result).url);
        }.bind(this), reject);
    }.bind(this));
};

DiscordSocket.createSocket = function(url, discord) {
    return new Promise(function(resolve, reject) {

        url = urlutils.parse(url);
        url.query = {encoding: 'json', v: Constants.API_VERSION};
        url.pathname = url.pathname || "/";

        var socket = new DiscordSocket(urlutils.format(url), discord);
        socket.once('open', function() {
            resolve(socket);
        });

    }.bind(this));
};

module.exports = DiscordSocket;
