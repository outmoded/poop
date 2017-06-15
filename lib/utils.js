'use strict';

// Load modules

const Fs     = require('fs');
const Mkdirp = require('mkdirp');
const Os     = require('os');
const Path   = require('path');


// Declare internals

const internals = {};


module.exports.log = function (err, options, callback) {

    Mkdirp(Path.dirname(options.logPath), (dirErr) => {

        if (dirErr) {
            callback(dirErr);
        }

        const log = Fs.createWriteStream(options.logPath, options.writeStreamOptions);
        const formattedErr = {
            message: err.message,
            stack: err.stack,
            timestamp: Date.now()
        };

        log.write(JSON.stringify(formattedErr) + Os.EOL, () => {

            log.end();
            callback();
        });
    });
};
