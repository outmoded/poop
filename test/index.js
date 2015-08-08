// Load modules

var Code = require('code');
var Lab = require('lab');
var Fs = require('fs');
var Hapi = require('hapi');
var Path = require('path');
var ChildProcess = require('child_process');


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
var it = lab.it;
var fork = ChildProcess.fork;
var logPath = __dirname + '/test1.log';

// Tests

it('can register the plugin', function (done) {

    var server = internals.createServer();
    internals.registerPlugin(server, {
        logPath: logPath
    }, function (err) {

        expect(err).to.not.exist();

        var other = internals.createServer();
        internals.registerPlugin(other, {
            logPath: logPath
        }, function (err) {

            expect(err).to.not.exist();
            done();
        });
    });
});

it('can log uncaught exceptions to the file provided and exits process', function (done) {

    var server = internals.createServer();
    internals.registerPlugin(server, {
        logPath: logPath
    }, function (err) {

        expect(err).to.not.exist();
    });

    process.exit = function (code) {

        expect(code).to.equal(1);
        expect(Fs.existsSync(logPath)).to.be.true();
        Fs.unlinkSync(logPath);

        done();
    };

    process.emit('uncaughtException', new Error('test'));
});

it('can log uncaught exceptions to the file provided with write options and exits process', function (done) {

    var child = fork('./test/worker');

    child.send({
        logPath: logPath,
        writeStreamOptions: { flags: 'a', mode: 0777 }
    });

    child.on('message', function (error) {

        expect(error).to.not.exist();
    });

    child.on('exit', function (code) {

        expect(code).to.equal(1);
        expect(Fs.existsSync(logPath)).to.be.true();

        done();
    });
});

it('can log uncaught exceptions to the existing log file with append options and exits process', function (done) {

    var child = fork('./test/worker');

    child.send({
        logPath: logPath,
        writeStreamOptions: { flags: 'a', mode: 0665 }
    });

    child.on('message', function (error) {

        expect(error).to.not.exist();
    });

    child.on('exit', function (code) {

        expect(code).to.equal(1);
        expect(Fs.existsSync(logPath)).to.be.true();
        Fs.unlinkSync(logPath);

        done();
    });
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
                    Fs.unlinkSync(Path.join(__dirname, '..', files[i]));
                }
            }

            expect(heapsAfter).to.equal(4);
            done();
        });
    }, 500);
});

it('can handle null options in register()', function (done) {

    var Poop = require('../');

    Poop.register({}, null, done);
});
