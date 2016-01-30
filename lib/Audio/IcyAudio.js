"use strict";

var icy = require('icy');
var Playable = require("../Logic/Playable.js");

// Used for Icecast and Shoutcast streams
class IcyAudio extends Playable {

    constructor(url, user) {
        super(user);
        this.url = url;
        this.title = "";
        this.streamUrl = null;
    }

    getTitle() {
        return this.title;
    }

    getAdditionalInfo() {
        return this.streamUrl;
    }

    createStream() {
        return new Promise(function(resolve, reject) {
            icy.get(this.url, function(res) {
                res.on('metadata', function(metadata) {
                    var parsed = icy.parse(metadata);
                    this.title = parsed.StreamTitle;
                    this.streamUrl = parsed.StreamUrl;
                    this.emit('data-changed');
                }.bind(this));
                resolve(res);
            }.bind(this)).on('error', reject);
        }.bind(this));
    }

}

module.exports = IcyAudio;