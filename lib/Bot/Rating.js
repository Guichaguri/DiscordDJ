"use strict";

class Rating {

    constructor(bot, dj, ratingOpt) {
        this.bot = bot;
        this.dj = dj;
        this.ratings = {};
        this.likes = 0;
        this.dislikes = 0;
        this.minVotes = ratingOpt.minVotes;
        this.minDislikes = ratingOpt.minDislikes; // Percentage

        var self = this;
        this.userUpdate = function(user, status, gameId) {
            if(status == 'offline') {
                self.setRating(user, null);
            }
        };
        bot.on('presence', this.userUpdate);
    }

    destroy() {
        this.bot.removeListener('presence', this.userUpdate);
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