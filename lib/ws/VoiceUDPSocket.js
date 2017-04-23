"use strict";

const dns = require('dns');
const dgram = require('dgram');

const VoiceSocket = require('./VoiceSocket.js');
const Constants = require('../Constants.js');

class VoiceUDPSocket extends VoiceSocket {

    constructor(dj, url, token, encryption) {
        super(dj, url, token, encryption);

        this.udp = null; // UDP Socket
        this.udpIp = null; // UDP IP
        this.udpPort = 80; // UDP Port
        this.localIp = null; // Local IP
        this.localPort = null; // Local Port
    }

    sendUDP(data) {
        this.udp.send(data, 0, data.length, this.udpPort, this.udpIp);
    }

    sendAudio(buffer, sampleCount) {
        let packet = this.createPacket(buffer, sampleCount);

        if(packet.length == Constants.IP_DISCOVERY_SIZE) {
            // Prevent the audio packet from looking as an ip discovery packet by adding one extra byte
            packet = Buffer.concat([packet, Buffer.alloc(1, 0)]);
        }

        this.sendUDP(packet);
    }

    handleReady(data) {
        super.handleReady(data);

        dns.resolve(VoiceUDPSocket.formatUDPAddr(this.url), function(err, addresses) {
            if(err) return console.err('Could not connect to a voice channel:', err); //TODO handle this in a better way

            this.udpIp = addresses[0];
            this.udpPort = data['port'];

            this.udp = dgram.createSocket('udp4');
            this.udp.on('message', this.handleUDPMessage.bind(this));

            // Send an ip discovery packet to the server to get the local ip and port
            let packet = Buffer.alloc(Constants.IP_DISCOVERY_SIZE, 0);
            packet.writeUInt32BE(this.ssrc, Constants.IP_DISCOVERY_SSRC_OFFSET);
            this.sendUDP(packet);

        }.bind(this));
    }

    handleUDPMessage(msg, from) {
        if(msg.length == Constants.IP_DISCOVERY_SIZE) { // Receive the local ip
            if(msg.readUInt32LE(Constants.IP_DISCOVERY_SSRC_OFFSET) != this.ssrc) return;

            // Thanks to discordie for the code below that retrieves the local ip and port
            this.localIp = msg.slice(4, 68).toString().split("\x00")[0];
            this.localPort = msg[68] | msg[69] << 8;

            // Select the protocol
            this.send(Constants.VOP_SELECT_PROTOCOL, {
                protocol: 'udp',
                data: {
                    address: this.localIp,
                    port: this.localPort,
                    mode: this.encryption
                }
            });
        }
    }

    terminate() {
        super.terminate();
        this.udp.close();
        this.udp = null;
    }

}

VoiceUDPSocket.formatUDPAddr = function(url) {
    // Removes port to prevent ENOTFOUND errors
    return url.substring(0, url.lastIndexOf(':'));
};

module.exports = VoiceUDPSocket;
