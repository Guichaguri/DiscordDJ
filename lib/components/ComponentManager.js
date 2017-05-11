"use strict";

const EventEmitter = require('events').EventEmitter;

class ComponentManager extends EventEmitter {

    constructor() {
        super();
        this._commands = {};
        this._converters = [];
        this.on('command', this._handleCommand);
    }

    /** @private */
    _handleCommand(label) {//TODO arguments
        const handler = this._commands[label];
        if(handler) handler(label);
    }

    /**
     * Registers a converter
     * @param {Class<Decoder>|Class<Encoder>|Class<Converter>} converter - A converter class
     */
    registerConverter(converter) {
        this._converters.push(converter);
    }

    /**
     * Registers a command handler for the labels
     * @param {string|Array} labels - The labels that will be handled
     * @param {Function} handler - The function which will receive commands
     */
    registerCommand(labels, handler) {
        if(labels instanceof Array) {
            for(let i = 0; i < labels.length; i++) {
                this._commands[labels[i]] = handler;
            }
        } else {
            this._commands[labels] = handler;
        }
    }

}
