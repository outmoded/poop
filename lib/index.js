// Load modules

var Poop = require('./poop');


// Declare internals

var internals = {};


exports.register = function (plugin, options, next) {

    var poop = new Poop(plugin, options);
    plugin.api(poop);

    process.once('uncaughtException', function (err) {

        poop.dump(err);
        process.exit(1);
    });

    return next();
};
