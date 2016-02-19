"use strict";

class Playlist {

    shuffle() {

    }

    hasNextSong() {
        return false;
    }

    getNextSong() {
        return null;
    }

    shuffleArray(array) {
        var counter = array.length, temp, index;
        while(counter > 0) {
            index = Math.floor(Math.random() * counter);
            counter--;
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }

}

module.exports = Playlist;