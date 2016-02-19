"use strict";

var EventEmitter = require('events').EventEmitter;

class Playlist extends EventEmitter {

    constructor() {
        super();
    }

    shuffle() {

    }

    hasNextSong() {
        return false;
    }

    getNextSong() {
        return null;
    }

    getLength() {
        return 0;
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