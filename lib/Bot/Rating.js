"use strict";

var Utils = require('../Logic/Utils.js');
var Discordie = require('discordie');

var likeCmd = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(!Utils.exists(dj.rating)) return;
    dj.rating.like(user);
};

var dislikeCmd = function(handler, obj, user, dj, args) {
    if(dj == null) return;
    if(!Utils.exists(dj.rating)) return;
    dj.rating.dislike(user);
};

class Rating {

    constructor(bot, dj, options) {
        this.bot = bot;
        this.dj = dj;
        this.ratings = {};
        this.likes = 0;
        this.dislikes = 0;
        this.minVotes = options.minVotes;
        this.minDislikes = options.minDislikes; // Percentage

        this.userUpdate = function(update) {
            if(update.member.status == Discordie.StatusTypes.OFFLINE) {
                this.setRating(update.member, null);
            }
        }.bind(this);
        this.bot.Dispatcher.on(Discordie.Events.PRESENCE_UPDATE, this.userUpdate);

        dj.handler.registerCommand('like', ['like', 'woot', '+1'], likeCmd, null);
        dj.handler.registerCommand('dislike', ['dislike', 'meh', '-1'], dislikeCmd, null);
    }

    destroy() {
        this.bot.Dispatcher.removeListener(Discordie.Events.PRESENCE_UPDATE, this.userUpdate);

        this.dj.handler.deregisterCommand('like');
        this.dj.handler.deregisterCommand('dislike');
    }

    like(user) {
        this.setRating(user, true);
    }

    dislike(user) {
        this.setRating(user, false);
    }

    setRating(user, rating) {
        if(rating == null) {
            delete this.ratings[user.id];
        } else {
            this.ratings[user.id] = rating;
        }
        this.recalculateRating();
    }

    resetRating() {
        this.ratings = {};
        this.likes = 0;
        this.dislikes = 0;
    }

    recalculateRating() {
        var likes = 0, dislikes = 0;
        for(var user in this.ratings) {
            if(typeof this.ratings[user] == 'undefined') continue;
            if(this.ratings[user]) {
                likes++;
            } else {
                dislikes++;
            }
        }
        this.likes = likes;
        this.dislikes = dislikes;
        this.dj.emit('info-update');

        var votes = likes + dislikes;
        if(votes >= this.minVotes) {
            var dp = (dislikes / votes) * 100;
            if(dp >= this.minDislikes) {
                this.dj.skip();
            }
        }
    }

}

module.exports = Rating;