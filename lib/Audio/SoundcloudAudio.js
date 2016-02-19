"use strict";
/*
 * ATTENTION!
 * Before using this class, make sure you read the Terms of Use from the Soundcloud API
 * https://developers.soundcloud.com/docs/api/terms-of-use
 */

var Playable = require('../Logic/Playable.js');
var Utils = require('../Logic/Utils.js');
var https = require('https');

class SoundcloudAudio extends Playable {

    constructor(url, key, user) {
        super(user);

        if(!Utils.SCRegex.test(url)) {
            throw new Error('Invalid URL');
        }

        this.url = url;
        this.key = key;
        this.title = url;
        this.streamUrl = null;
    }

    init(dj) {
        this.key = dj.keys.soundcloud;
    }

    getTitle() {
        return this.title;
    }

    getAdditionalInfo() {
        return this.url + " *via Soundcloud*";
    }

    loadData() {
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
                    this.loadResponse(data);
                    this.emit('data-changed');
                });
            });
        }.bind(this));
    }

    loadResponse(json) {
        this.title = (json['label_name'] != '' ? json['label_name'] : json['user']['username']) + " - " + json['title'];
        this.streamUrl = json['stream_url'] + "?client_id=" + encodeURIComponent(this.key);
        this.url = json['permalink_url'];
    }

    createStream() {
        return new Promise(function(resolve, reject) {
            if(this.streamUrl != null) {
                this.loadStream(this.streamUrl, resolve);
            } else {
                this.once('data-changed', function() {
                    this.loadStream(this.streamUrl, resolve);
                }.bind(this));
                this.loadData();
            }
        }.bind(this));
    }

    loadStream(url, callback) {
        https.get(url, function(res) {
            if(typeof res.headers.location != 'undefined' && res.headers.location != null) {
                if(res.headers.location != url) {
                    this.loadStream(res.headers.location, callback);
                    return;
                }
            }
            callback(res);
        }.bind(this));
    }

}

module.exports = SoundcloudAudio;