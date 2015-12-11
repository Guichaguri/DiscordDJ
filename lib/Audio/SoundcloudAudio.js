"use strict";
/*
 * ATTENTION!
 * Before using this class, make sure you read the Terms of Use from the Soundcloud API
 * https://developers.soundcloud.com/docs/api/terms-of-use
 */

var Playable = require('../Logic/Playable.js');
var https = require('https');
var urlparser = require('url');

class SoundcloudAudio extends Playable {

    constructor(user, url, key) {
        super(user);

        var u = urlparser.parse(url);
        if(u.hostname == '') {

        }

        this.url = url;
        this.key = key;
        this.title = url;
        this.streamUrl = null;
    }

    getTitle() {
        return this.title;
    }

    getAdditionalInfo() {
        return this.url + " *via Soundcloud*";
    }

    loadData() {
        var self = this;
        https.get('https://api.soundcloud.com/resolve?url=' + encodeURIComponent(this.url) +
            '&client_id=' + encodeURIComponent(this.key), function(res) {
            var loc = res.headers.location;
            https.get(loc, function(ress) {
                var result = '';
                ress.on('data', function(chunk) {
                    result += chunk;
                });
                ress.on('end', function() {
                    var data = JSON.parse(result);
                    self.loadResponse(data);
                    self.emit('data-changed');
                });
            });
        });
    }

    loadResponse(json) {
        this.title = (data['label_name'] != '' ? data['label_name'] : data['user']['username']) + " - " + data['title'];
        this.streamUrl = data['stream_url'] + "?client_id=" + encodeURIComponent(this.key);
        this.url = data['permalink_url'];
    }

    createStream(callback) {
        if(this.streamUrl != null) {
            this.loadStream(this.streamUrl, callback);
        } else {
            var self = this;
            this.once('data-changed', function() {
                self.loadStream(self.streamUrl, callback);
            });
            this.loadData();
        }
    }

    loadStream(url, callback) {
        var self = this;
        https.get(url, function(res) {
            if(typeof res.headers.location != 'undefined' && res.headers.location != null) {
                if(res.headers.location != url) {
                    self.loadStream(res.headers.location, callback);
                    return;
                }
            }
            callback(res);
        });
    }

}

module.exports = SoundcloudAudio;