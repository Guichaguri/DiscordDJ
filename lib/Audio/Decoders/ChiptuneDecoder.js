"use strict";

const Decoder = require('../../Logic/Decoder.js');
var chiptune = null;

const formats = ['mod', 's3m', 'xm', 'it', 'mptm', 'stm', 'nst', 'm15', 'stk', 'wow', 'ult', '669', 'mtm',
        'med', 'far', 'mdl', 'ams', 'dsm', 'amf', 'okt', 'dmf', 'ptm', 'psm', 'mt2', 'dbm', 'digi', 'imf',
        'j2b', 'gdm', 'umx', 'plm', 'mo3', 'xpk', 'ppm', 'mmcmp'];

class ChiptuneDecoder extends Decoder {

    constructor() {
        super();
        this.instance = null;
    }


    canDecode(format) {
        return formats.indexOf(format) != -1;
    }

    createDecoder(stream, options) {
        return new Promise(function(resolve, reject) {
            if(chiptune == null) {
                chiptune = require('node-chiptune'); // Only require when needed. Less memory usage.
            }
            this.instance = chiptune({
                sampleRate: options.sampleRate,
                channels: options.channels,
                readSize: 2880
            });
            stream.pipe(this.instance);

            this.instance.once('readable', function() {
                resolve(this.instance);
            }.bind(this));
        }.bind(this));
    }

    destroyDecoder() {
        this.instance.destroy();
    }

    getTitle() {
        if(this.instance == null) return null;
        var md = this.instance.metadata;
        return md.title + ' - ' + md.artist;
    }

    getAdditionalInfo() {
        if(this.instance == null) return null;
        return this.instance.metadata.message;
    }

    getPriority() {
        return 50;
    }

}

module.exports = ChiptuneDecoder;