"use strict";

const WebSocket = require('ws');

class APISocket extends WebSocket {

    constructor(url) {
        super(url);
        this.hearbeatInterval = 1000; // The time in milliseconds to send heartbeats
        this.heartbeaten = true; // Whether the heartbeat was successful
        this.heartbeat = null; // Heartbeat interval

        this.on('error', this.handleError.bind(this));
        this.on('message', this.handleMessage.bind(this));
        this.once('close', this.handleClosing.bind(this));
    }

    sendHeartbeat() {
        // NOOP
    }

    startHeartbeating() {
        if(this.heartbeat != null) clearInterval(this.heartbeat);
        this.heartbeat = setInterval(this.sendHeartbeat.bind(this), this.hearbeatInterval);
    }

    handleError(error) {
        console.log('Error: ', error);
    }

    handleMessage(data, flags) {
        // NOOP
    }

    handleClosing(code, message) {
        clearInterval(this.heartbeat);
        this.heartbeat = null;

        console.log('Close:', code, message);
    }

}

module.exports = APISocket;
