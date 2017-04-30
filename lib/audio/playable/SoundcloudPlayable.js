"use strict";

const Playable = require('../../interfaces/Playable.js');
const Utils = require('../../Utils.js');

const https = require('https');

class SoundcloudPlayable extends Playable {

    constructor(key, url) {
        super();
        this.key = key;
        this.url = url;
    }

    get title() {
        return this._title;
    }

    get artist() {
        return this._artist;
    }

    get description() {
        return this._description;
    }

    loadData() {
        return new Promise(function(resolve, reject) {
            https.get('https://api.soundcloud.com/resolve?' +
                    'client_id=' + encodeURIComponent(this.key) +
                    '&url=' + encodeURIComponent(this.url), function(res) {

                Utils.request(res.headers.location).then(function(data) {
                    this.readInfo(JSON.parse(data));
                    resolve();
                }, reject);

            });
        });
    }

    readData(json) {
        this._title = json['title'];
        this._artist = json['label_name'] || json['user']['username'];
        this._description = json['description'];

        this.streamUrl = json['stream_url'] + "?client_id=" + encodeURIComponent(this.key);
        this.url = json['permalink_url'];

        this.emit('data-changed');
    }

    loadStream(resolve, reject) {
        https.get(this.streamUrl, function(res) {
            resolve(res, res.headers['Content-Type']);
        });
    }

    createStream() {
        return new Promise(function(resolve, reject) {
            if(this.streamUrl) {
                this.loadStream(resolve, reject);
            } else {
                this.loadData().then(function() {
                    this.loadStream(resolve, reject);
                }.bind(this), reject);
            }
        }.bind(this));
    }

}

module.exports = SoundcloudPlayable;
