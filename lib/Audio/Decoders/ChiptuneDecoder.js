"use strict";

const Decoder = require('../../Logic/Decoder.js');
const chiptune = require('node-chiptune');

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

    createDecoder(stream, encoder) {
        this.instance = chiptune();
        stream.pipe(this.instance).pipe(encoder);
    }

    destroyDecoder() {
        this.instance.destroy();
    }

    getTitle() {
        var md = this.instance.metadata;
        return md.title + ' - ' + md.artist;
    }

    getAdditionalInfo() {
        return this.instance.metadata.message;
    }

}