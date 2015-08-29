'use strict';

// Load modules

var Fs = require('fs');
var Os = require('os');


// Declare internals

var internals = {};


module.exports.log = function (err, options, callback) {

    var log = Fs.createWriteStream(options.logPath, options.writeStreamOptions);
    var formattedErr = {
        message: err.message,
        stack: err.stack,
        timestamp: Date.now()
    };

    log.write(JSON.stringify(formattedErr) + Os.EOL, function () {

        log.end();
        callback();
    });
};
