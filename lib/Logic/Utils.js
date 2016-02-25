module.exports = {

    // Regular Expressions
    YTRegex: /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(&(amp;)?[\w\?=]*)?/,
    SCRegex: /(?:https?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(.*)/,
    YTPlaylistRegex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([A-Za-z0-9_-]+)/,
    SCPlaylistRegex: /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/([a-zA-Z0-9]+)\/sets\/(.*)/,

    include: function(pkg) {
        try {
            return require(pkg);
        } catch(e) {
            return null;
        }
    },

    exists: function(obj) {
        if(obj === undefined) return false;
        if(obj == null) return false;
        if(obj == '') return false;
        return true;
    },

    getExtension(filename) {
        var pos = filename.lastIndexOf('.');
        if(pos == -1) return null;
        return filename.substring(pos + 1);
    },

    registerDecoder(decoder) {
        if(typeof global.decoders == 'undefined') {
            global.decoders = [];
        }
        global.decoders.push(decoder);
    },

    getDecoders() {
        if(typeof global.decoders == 'undefined') {
            return [];
        }
        global.decoders.sort(function(decoder1, decoder2) {
            return decoder1.getPriority() - decoder2.getPriority();
        });

        return global.decoders;
    }

};