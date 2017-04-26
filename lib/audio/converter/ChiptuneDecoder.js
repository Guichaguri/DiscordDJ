"use strict";

const Decoder = require('../../../interfaces/Decoder.js');

const chiptune = (function() {
    try {
        return require('node-chiptune');
    } catch(e) {
        return null;
    }
})();

const formats = ['mod', 's3m', 'xm', 'it', 'mptm', 'stm', 'nst', 'm15', 'stk', 'wow', 'ult', '669', 'mtm',
        'med', 'far', 'mdl', 'ams', 'dsm', 'amf', 'okt', 'dmf', 'ptm', 'psm', 'mt2', 'dbm', 'digi', 'imf',
        'j2b', 'gdm', 'umx', 'plm', 'mo3', 'xpk', 'ppm', 'mmcmp'];

const mimetypes = formats.map(function(format) {
    return 'audio/' + format;
});

class ChiptuneDecoder extends Decoder {

    static get available() {
        return chiptune != null;
    }

    static decodes(mimetype) {
        return mimetypes.includes(mimetype);
    }

    static decode(stream, rate, channels) {
        return stream.pipe(chiptune({
            sampleRate: rate,
            channels: channels
        }));
    }


}

module.exports = ChiptuneDecoder;
