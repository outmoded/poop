// Load modules

var Fs = require('fs');
var HeapDump = require('heapdump');
var Hoek = require('hoek');
var Path = require('path');


// Declare internals

var internals = {};


internals.defaults = {
    logPath: Path.join(__dirname, '..', 'poop.log')
};


module.exports = internals.Poop = function (plugin, options) {

    Hoek.assert(this.constructor === internals.Poop, 'Poop must be instantiated using new');

    this.plugin = plugin;
    this.settings = Hoek.applyToDefaults(internals.defaults, options || {});
};


internals.Poop.prototype.dump = function (err) {

    HeapDump.writeSnapshot();

    if (!this._log) {
        this._log = Fs.createWriteStream(this.settings.logPath);
    }

    var formattedErr = {
        message: err.message,
        stack: err.stack,
        timestamp: Date.now()
    };

    this._log.write(JSON.stringify(formattedErr), this.wipe);
};


internals.Poop.prototype.wipe = function () {

    this._log && this._log.end();
};
