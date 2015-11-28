"use strict";

var icy = require('icy');
var through = require('through2');
var Playable = require("../Logic/Playable.js");

var HTTP10 = new Buffer('HTTP/1.0');

// Used for Icecast and Shoutcast streams
class IcyAudio extends Playable {

    constructor(user, url) {
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
        var stream = through();
        var self = this;
        icy.get(this.url, function(res) {
            res.on('metadata', function(metadata) {
                var parsed = icy.parse(metadata);
                self.title = parsed.StreamTitle;
                self.streamUrl = parsed.StreamUrl;
                self.emit('data-changed');
            });
            res.pipe(stream);
        });
        return stream;
    }

}

module.exports = IcyAudio;