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


const register = function (server, options) {

    const settings = Object.assign({}, internals.defaults, options);

    if (internals.initialized) {
        return;
    }

    internals.initialized = true;

    process.once('uncaughtException', async (err) => {

        HeapDump.writeSnapshot(Path.join(settings.heapdumpFolder, 'heapdump-' + Date.now() + '.heapsnapshot'));

        // Don't try to catch any errors since the process is exiting anyway.
        await Utils.log(err, {
            logPath: settings.logPath,
            writeStreamOptions: settings.writeStreamOptions
        });

        process.exit(1);
    });

    process.on('SIGUSR1', () => {

        HeapDump.writeSnapshot(Path.join(settings.heapdumpFolder, 'heapdump-' + Date.now() + '.heapsnapshot'));
    });
};


module.exports = {
    pkg: require('../package.json'),
    register
};
