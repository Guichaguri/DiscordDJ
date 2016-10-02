"use strict";

const urlutils = require('url');

const APISocket = require('./APISocket.js');
const Constants = require('../Constants.js');

const secretbox = (function() {
    try {
        return require('sodium').api.crypto_secretbox;
    } catch(e) {
        return require('tweetnacl').secretbox;
    }
})();

class VoiceSocket extends APISocket {

    constructor(dj, url, token, encryption) {
        super(VoiceSocket.formatWSAddr(url));
        this.url = url; // The socket URL
        this.dj = dj; // DJ instance
        this.encryption = encryption; // Encryption

        this.secret = null; // Secret Key
        this.ssrc = null; // SSRC
        this.seq = 0; // Sequence Number
        this.timestamp = 0; // Timestamp
        this.header = null; // Header Buffer

        this.once('open', function() {
            // Identify ourselves :)
            this.send(Constants.VOP_IDENTITY, {
                server_id: dj.guildId,
                user_id: dj._discord._socket.userId,
                session_id: dj._discord._socket.sessionId,
                token: token
            });
        }.bind(this));
    }

    send(op, data) {
        super.send(JSON.stringify({op: op, d: data}));
    }

    sendAudio(buffer, sampleCount) {
        // NOOP
    }

    /**
     * Creates a packet based on a Opus encoded buffer
     */
    createPacket(buffer, sampleCount) {
        if(this.header == null) {
            this.header = new Buffer(Constants.VB_HEADER_SIZE + Constants.VB_NONCE_SIZE);
            this.header.fill(0);
            this.header[Constants.VB_HEADER_TYPE_OFFSET] = 0x80; // Type
            this.header[Constants.VB_HEADER_VERSION_OFFSET] = 0x78; // Version
            this.header.writeUInt32BE(this.ssrc, Constants.VB_HEADER_SSRC_OFFSET); // SSRC
        }

        this.header.writeUInt16BE(this.seq, Constants.VB_HEADER_SEQ_OFFSET); // Sequence
        this.header.writeUInt32BE(this.timestamp, Constants.VB_HEADER_TIMESTAMP_OFFSET); // Timestamp

        if(this.encryption == Constants.VOICE_ENCRYPTION_SODIUM) {
            buffer = secretbox(buffer, this.header, this.secret);
        }

        // Thanks to discordie, again, for the code below
        const rtpPacket = VoiceSocket.rtpPacket;
        const bufferLength = buffer.length;
        this.header.copy(rtpPacket, 0, 0, Constants.VB_HEADER_SIZE);
        for(var i = 0; i < bufferLength; i++) {
            rtpPacket[Constants.VB_HEADER_SIZE + i] = buffer[i];
        }

        this.seq++;
        this.timestamp += sampleCount;
        if(this.seq >= 0xFFFF) this.seq %= 0xFFFF + 1;
        if(this.timestamp >= 0xFFFFFFFF) this.timestamp %= 0xFFFFFFFF + 1;

        return rtpPacket.slice(0, buffer.length + Constants.VB_HEADER_SIZE);
    }

    sendHeartbeat() {
        if(!this.heartbeaten) {
            console.log('NO CONNECTION!');
            return; // TODO
        }
        this.send(Constants.VOP_HEARTBEAT, Date.now());
        this.heartbeaten = false;
    }

    handleReady(data) {
        this.hearbeatInterval = data['heartbeat_interval'];
        this.startHeartbeating();

        this.ssrc = data['ssrc'];
        this.header = null;
    }

    handleMessage(data, flags) {
        let json = JSON.parse(data);

        switch(json['op']) {
            case Constants.VOP_SPEAKING:
                // Just ignore it
                break;
            case Constants.VOP_HEARTBEAT:
                this.heartbeaten = true;
                break;
            case Constants.VOP_READY:
                this.handleReady(json['d']);
                break;
            case Constants.VOP_SESSION_DESCRIPTION:
                this.secret = Buffer.from(json['d']['secret_key']);
                this.dj.emit('ready'); // We are finally ready to send voice packets!
                break;
            default:
                console.log('Unknown Voice OP Code:', json['op']);
                break;
        }
    }

}

VoiceSocket.formatWSAddr = function(url) {
    // Removes port 80 to prevent EPROTO errors
    let i = url.lastIndexOf(':');
    if(url.substring(i + 1) == '80') url = url.substring(0, i);

    return 'wss://' + url; // Adds websocket protocol
};

VoiceSocket.rtpPacket = new Buffer(2048); // Pre-allocate the buffer
VoiceSocket.rtpPacket.fill(0);

module.exports = VoiceSocket;
