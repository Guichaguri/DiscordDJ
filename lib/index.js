/*
 * This is the API of the module
 */

module.exports = {
    DJ: require('./Logic/DJ.js'),
    FileAudio: require('./Audio/FileAudio.js'),
    YoutubeVideo: require('./Audio/YoutubeVideo.js'),
    IcyAudio: require('./Audio/IcyAudio.js')
};