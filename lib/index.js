/*
 * This is the API of the module
 */
const Utils = require('./Logic/Utils.js');

module.exports = {

    DJManager: require('./Logic/DJManager.js'),

    // Logic
    DJ: require('./Logic/DJ.js'),
    Playable: require('./Logic/Playable.js'),
    Playlist: require('./Logic/Playlist.js'),
    Decoder: require('./Logic/Decoder.js'),

    // Decoders
    FFmpegDecoder: require('./Audio/Decoders/FFmpegDecoder.js'),
    ChiptuneDecoder: require('./Audio/Decoders/ChiptuneDecoder.js'),

    // Audio
    FileAudio: require('./Audio/FileAudio.js'),
    YoutubeVideo: require('./Audio/YoutubeVideo.js'),
    IcyAudio: require('./Audio/IcyAudio.js'),
    StreamAudio: require('./Audio/StreamAudio.js'),
    SoundcloudAudio: require('./Audio/SoundcloudAudio.js'),

    // Playlists
    DirectoryPlaylist: require('./Audio/Playlist/DirectoryPlaylist.js'),
    FilePlaylist: require('./Audio/Playlist/FilePlaylist.js'),
    SoundcloudPlaylist: require('./Audio/Playlist/SoundcloudPlaylist.js'),
    YoutubePlaylist: require('./Audio/Playlist/YoutubePlaylist.js'),

    // Default DJ Implementation
    BotDJ: require('./Bot/BotDJ.js'),
    Mode: require('./Bot/Mode.js'),
    DJMode: require('./Bot/DJMode.js'),
    PlaylistMode: require('./Bot/PlaylistMode.js'),

    // Other functions
    registerDecoder: Utils.registerDecoder,
    getDecoders: Utils.getDecoders

};