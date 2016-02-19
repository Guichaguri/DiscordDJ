module.exports = {

    // Regular Expressions
    YTRegex: /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(&(amp;)?[\w\?=]*)?/,
    SCRegex: /(?:https?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(.*)/,
    YTPlaylistRegex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([A-Za-z0-9]+)/,
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
    }

};