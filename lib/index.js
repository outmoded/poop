// Load modules

var Fs = require('fs');
var HeapDump = require('heapdump');
var Hoek = require('hoek');
var Path = require('path');


// Declare internals

var internals = {
    defaults: {
        logPath: Path.join(__dirname, '..', 'poop.log')
    }
};


exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

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
