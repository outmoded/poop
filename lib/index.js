'use strict';

// Load modules

const Path = require('path');
const HeapDump = require('heapdump');
const Utils = require('./utils');


// Declare internals

const internals = {
    initialized: false,
    defaults: {
        logPath: Path.join(process.cwd(), 'poop.log'),
        heapdumpFolder: process.cwd(),
        writeStreamOptions: { flags: 'w' }
    }
};


module.exports.register = function (server, options, next) {

    const settings = Object.assign({}, internals.defaults, options);

    if (internals.initialized) {
        return next();
    }

    internals.initialized = true;

    process.once('uncaughtException', (err) => {

        HeapDump.writeSnapshot(Path.join(settings.heapdumpFolder, 'heapdump-' + Date.now() + '.heapsnapshot'));
        Utils.log(err, {
            logPath: settings.logPath,
            writeStreamOptions: settings.writeStreamOptions
        }, () => {

            process.exit(1);
        });
    });

    process.on('SIGUSR1', () => {

        HeapDump.writeSnapshot(Path.join(settings.heapdumpFolder, 'heapdump-' + Date.now() + '.heapsnapshot'));
    });

    return next();
};


module.exports.register.attributes = {
    pkg: require('../package.json')
};
