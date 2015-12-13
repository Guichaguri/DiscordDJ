"use strict";

var http = require('http');
var https = require('https');
var url_parser = require('url');
var Playable = require("../Logic/Playable.js");

// Used for direct online audio files
class StreamAudio extends Playable {

    constructor(user, url, title) {
        super(user);
        this.url = url;
        this.title = title === undefined ? null : title;
    }

    loadData() {
        if(url instanceof String || typeof url == 'string') {
            url = url_parser.parse(url);
        }
        if(this.title == null) {
            this.title = url.href;
            this.emit('data-changed');
        }
    }

    getTitle() {
        return this.title;
    }

    getAdditionalInfo() {
        return null;
    }

    createStream(callback) {
        this.loadData();

        if(url.protocol.length > 5 && url.protocol.substring(0, 5) == 'https') {
            https.get(url, function(res) {
                callback(res);
            });
        } else {
            http.get(url, function(res) {
                callback(res);
            });
        }
    }

}

module.exports = StreamAudio;