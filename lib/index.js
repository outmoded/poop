// Load modules

var Fs = require('fs');
var Path = require('path');
var HeapDump = require('heapdump');
var Hoek = require('hoek');


// Declare internals

var internals = {
    initialized: false,
    defaults: {
        logPath: Path.join(__dirname, '..', 'poop.log')
    }
};


exports.register = function (server, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (internals.initialized) {
        return next();
    }

    internals.initialized = true;

    process.once('uncaughtException', function (err) {

        HeapDump.writeSnapshot();

        var log = Fs.createWriteStream(settings.logPath);
        var formattedErr = {
            message: err.message,
            stack: err.stack,
            timestamp: Date.now()
        };

        log.write(JSON.stringify(formattedErr), function () {

            log.end();
            process.exit(1);
        });
    });

    process.on('SIGUSR1', function () {

        HeapDump.writeSnapshot();
    });

    return next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};
