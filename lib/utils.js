'use strict';

// Load modules

const Fs = require('fs');
const Os = require('os');


// Declare internals

const internals = {};


module.exports.log = function (err, options, callback) {

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
};
