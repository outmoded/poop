'use strict';

// Load modules

const Fs = require('fs');
const Os = require('os');
const Path = require('path');
const Util = require('util');
const Mkdirp = require('mkdirp');
const Teamwork = require('teamwork');


// Declare internals

const internals = {
    mkdirp: Util.promisify(Mkdirp)
};


module.exports.log = async function (err, options) {

    await internals.mkdirp(Path.dirname(options.logPath));
    const log = Fs.createWriteStream(options.logPath, options.writeStreamOptions);
    const formattedErr = {
        message: err.message,
        stack: err.stack,
        timestamp: Date.now()
    };
    const team = new Teamwork();

    log.write(JSON.stringify(formattedErr) + Os.EOL, () => {

        log.end();
        team.attend();
    });

    await team.work;
};
