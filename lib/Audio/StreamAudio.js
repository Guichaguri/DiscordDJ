"use strict";

var http = require('http');
var https = require('https');
var url_parser = require('url');
var Playable = require("../Logic/Playable.js");

// Used for direct online audio files
class StreamAudio extends Playable {

    constructor(url, user, title) {
        super(user);
        this.url = url;
        this.title = title === undefined ? null : title;
    }

    loadData() {
        if(typeof this.url == 'string') {
            this.url = url_parser.parse(this.url);
        }
        if(this.title == null) {
            this.title = this.url.href;
            this.emit('data-changed');
        }
    }

    getTitle() {
        return this.title;
    }

    getAdditionalInfo() {
        return null;
    }

    createStream() {
        return new Promise(function(resolve, reject) {
            this.loadData();

            if(this.url.protocol.length > 5 && this.url.protocol.substring(0, 5) == 'https') {
                https.get(this.url, function(res) {
                    resolve(res);
                }).on('error', reject);
            } else {
                http.get(this.url, function(res) {
                    resolve(res);
                }).on('error', reject);
            }
        }.bind(this));
    }

}

module.exports = StreamAudio;