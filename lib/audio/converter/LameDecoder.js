"use strict";

const Decoder = require('../../../interfaces/Decoder.js');

const lame = (function() {
    try {
        return require('lame');
    } catch(e) {
        return null;
    }
})();

const mimetypes = ['audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'video/mpeg', 'video/x-mpeg'];

class LameDecoder extends Decoder {

    static get available() {
        return lame != null;
    }

    static decodes(mimetype) {
        return mimetypes.includes(mimetype);
    }

    static decode(stream) {
        return stream.pipe(new lame.Decoder());
    }

}

module.exports = LameDecoder;
