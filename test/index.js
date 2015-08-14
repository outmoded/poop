// Load modules

var Code = require('code');
var Lab = require('lab');
var Fs = require('fs');
var Hapi = require('hapi');
var Path = require('path');


// Declare internals

var internals = {};
internals.createServer = function () {

    var server = new Hapi.Server();
    server.connection();
    return server;
};
internals.registerPlugin = function (connection, pluginOptions, callBack) {

    connection.register({
        register: require('../'),
        options: pluginOptions
    }, function (err) {

        expect(err).to.not.exist();
        if (typeof callBack === 'function') {
            callBack.call();
        }
    });
};

// Test shortcuts

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var after = lab.after;
var it = lab.it;

var logPath = __dirname + '/test1.log';

after(function (done) {

    Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

        var heaps = 0;
        for (var i = 0, il = files.length; i < il; ++i) {
            if (files[i].indexOf('heapdump-') === 0) {
                heaps++;
                Fs.unlinkSync(Path.join(__dirname, '..', files[i]));
            }
        }

        done();
    });
});

it('can register the plugin with logPath', function (done) {

    var server = internals.createServer();
    internals.registerPlugin(server, {
        logPath: logPath
    }, function () {

        var other = internals.createServer();
        internals.registerPlugin(other, {
            logPath: logPath
        }, done);
    });
});

it('can register the plugin with logPath and writeStreamOptions', function (done) {

    var streamOptions = {
        flags: 'a',
        mode: 0644
    };
    var server = internals.createServer();
    internals.registerPlugin(server, {
        logPath: logPath,
        writeStreamOptions: streamOptions
    }, function () {

        var other = internals.createServer();
        internals.registerPlugin(other, {
            logPath: logPath,
            writeStreamOptions: streamOptions
        }, done);
    });
});

it('can log uncaught exceptions to the file provided with write stream options and exits process', function (done) {

    var server = internals.createServer();
    internals.registerPlugin(server, {
        logPath: logPath,
        writeStreamOptions: {
            flags: 'w',
            mode: 0766
        }
    });

    var orig = process.exit;
    process.exit = function (code) {

        process.exit = orig;
        expect(code).to.equal(1);
        expect(Fs.existsSync(logPath)).to.be.true();
        Fs.unlinkSync(logPath);

        done();
    };

    process.emit('uncaughtException', new Error('test'));
});

it('can handle SIGUSR1 events', function (done) {

    var server = internals.createServer();
    internals.registerPlugin(server, { logPath: logPath });

    setTimeout(function () {

        process.emit('SIGUSR1');

        Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

            var heapsAfter = 0;
            for (var i = 0, il = files.length; i < il; ++i) {
                if (files[i].indexOf('heapdump-') === 0) {
                    heapsAfter++;
                }
            }

            expect(heapsAfter).to.equal(2);
            done();
        });
    }, 500);
});

it('can handle null options in register()', function (done) {

    var Poop = require('../');

    Poop.register({}, null, done);
});
