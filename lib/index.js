/*
 * This is the API of the module
 */

module.exports = {
    DJManager: require('./Logic/DJManager.js'),

    DJ: require('./Logic/DJ.js'),
    Playable: require('./Logic/Playable.js'),
    Playlist: require('./Logic/Playlist.js'),

    FileAudio: require('./Audio/FileAudio.js'),
    YoutubeVideo: require('./Audio/YoutubeVideo.js'),
    IcyAudio: require('./Audio/IcyAudio.js'),
    StreamAudio: require('./Audio/StreamAudio.js'),
    SoundcloudAudio: require('./Audio/SoundcloudAudio.js'),

    DirectoryPlaylist: require('./Audio/Playlist/DirectoryPlaylist.js'),
    FilePlaylist: require('./Audio/Playlist/FilePlaylist.js'),
    SoundcloudPlaylist: require('./Audio/Playlist/SoundcloudPlaylist.js'),
    YoutubePlaylist: require('./Audio/Playlist/YoutubePlaylist.js'),

    // Default DJ Implementation
    DiscordDJ: require('./Bot/DiscordDJ.js'),
    Mode: require('./Bot/Mode.js'),
    DJMode: require('./Bot/DJMode.js'),
    PlaylistMode: require('./Bot/PlaylistMode.js')
};