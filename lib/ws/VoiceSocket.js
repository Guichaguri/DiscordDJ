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
        this.rtpHeader = null; // RTP Header Buffer

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

    setSpeaking(speaking) {
        this.send(Constants.VOP_SPEAKING, {
            delay: 0,
            speaking: speaking
        });
    }

    /** @private */
    _initHeader() {
        // RTP Header
        this.rtpHeader = Buffer.alloc(Constants.RTP_HEADER_SIZE + Constants.RTP_NONCE_SIZE, 0);
        this.rtpHeader[Constants.RTP_HEADER_VERSION_OFFSET] = 0x80; // Version 2
        this.rtpHeader[Constants.RTP_HEADER_TYPE_OFFSET] = 0x78; // Type 120
        this.rtpHeader.writeUInt32BE(this.ssrc, Constants.RTP_HEADER_SSRC_OFFSET); // SSRC
    }

    /**
     * Creates a packet based on a Opus encoded buffer
     */
    createPacket(buffer, sampleCount) {
        if(this.rtpHeader == null) this._initHeader();

        // Write packet data
        this.rtpHeader.writeUInt16BE(this.seq, Constants.RTP_HEADER_SEQ_OFFSET); // Sequence
        this.rtpHeader.writeUInt32BE(this.timestamp, Constants.RPT_HEADER_TIMESTAMP_OFFSET); // Timestamp

        // Use encryption when necessary
        if(this.encryption == Constants.VOICE_ENCRYPTION_SODIUM) {
            buffer = secretbox(buffer, this.rtpHeader, this.secret);
        }

        // Thanks to discordie, again, for the code below
        // Copies the header and then the audio buffer
        const rtpPacket = VoiceSocket.rtpPacket;
        const bufferLength = buffer.length;
        this.rtpHeader.copy(rtpPacket, 0, 0, Constants.RTP_HEADER_SIZE);
        for(var i = 0; i < bufferLength; i++) {
            rtpPacket[Constants.RTP_HEADER_SIZE + i] = buffer[i];
        }

        // Increases sequence and timestamp, clamping them to not overflow its packets sizes
        this.seq++;
        this.timestamp += sampleCount;
        if(this.seq >= 0xFFFF) this.seq %= 0xFFFF + 1; // Prevents overflowing 2 unsigned bytes
        if(this.timestamp >= 0xFFFFFFFF) this.timestamp %= 0xFFFFFFFF + 1; // Prevents overflowing 4 unsigned bytes

        // Slices the packet data from the buffer
        return rtpPacket.slice(0, bufferLength + Constants.RTP_HEADER_SIZE);
    }

    sendHeartbeat() {
        if(!this.heartbeaten) {
            console.log('NO VOICE CONNECTION!');
            return; // TODO
        }
        this.send(Constants.VOP_HEARTBEAT, Date.now());
        this.heartbeaten = false;
    }

    handleReady(data) {
        this.hearbeatInterval = data['heartbeat_interval'];
        this.startHeartbeating();

        this.ssrc = data['ssrc'];
        this.rtpHeader = null;
    }

    handleMessage(data, flags) {
        let json = JSON.parse(data);

        switch(json['op']) {
            case Constants.VOP_SPEAKING:
            case Constants.VOP_IGNORE:
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
                this.setSpeaking(false);
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

VoiceSocket.rtpPacket = Buffer.alloc(2048, 0); // Pre-allocate the buffer

module.exports = VoiceSocket;
