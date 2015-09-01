'use strict';

// Load modules

var Fs = require('fs');
var Os = require('os');
var Path = require('path');
var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Poop = require('../lib');
var PoopUtils = require('../lib/utils');


// Declare internals

var internals = {
    logPath: Path.join(__dirname, 'test.log')
};


// Test shortcuts

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;


describe('Poop', function () {

    lab.afterEach(function (done) {

        internals.cleanup(done);
    });

    it('logs uncaught exceptions, takes dump, and exits process', function (done) {

        internals.prepareServer(function (err, server) {

            var orig = process.exit;

            process.exit = function (code) {

                process.exit = orig;
                expect(code).to.equal(1);

                var exception = JSON.parse(Fs.readFileSync(internals.logPath, 'utf8'));

                expect(exception.message).to.equal('test');
                expect(exception.stack).to.be.a.string();
                expect(exception.timestamp).to.be.a.number();
                Fs.unlinkSync(internals.logPath);
                internals.countHeaps(function (err, count) {

                    expect(err).to.not.exist();
                    expect(count).to.equal(1);
                    done();
                });
            };

            process.emit('uncaughtException', new Error('test'));
        });
    });

    it('takes dump on SIGUSR1 events', function (done) {

        internals.prepareServer(function (err, server) {

            expect(err).to.not.exist();
            process.emit('SIGUSR1');
            internals.countHeaps(function (err, count) {

                expect(err).to.not.exist();
                expect(count).to.equal(1);
                done();
            });
        });
    });

    it('configures the the log file', function (done) {

        var err1 = new Error('test 1');
        var err2 = new Error('test 2');
        var options = {
            logPath: Path.join(__dirname, 'config.log'),
            writeStreamOptions: { flags: 'a' }
        };

        PoopUtils.log(err1, options, function () {

            PoopUtils.log(err2, options, function () {

                var exceptions = Fs.readFileSync(options.logPath, 'utf8').split(Os.EOL);
                var ex1 = JSON.parse(exceptions[0]);
                var ex2 = JSON.parse(exceptions[1]);

                expect(ex1.message).to.equal('test 1');
                expect(ex1.stack).to.be.a.string();
                expect(ex1.timestamp).to.be.a.number();
                expect(ex2.message).to.equal('test 2');
                expect(ex2.stack).to.be.a.string();
                expect(ex2.timestamp).to.be.a.number();
                Fs.unlinkSync(options.logPath);
                done();
            });
        });
    });

    it('can register the plugin multiple times', function (done) {

        internals.prepareServer(function (err, server) {

            expect(err).to.not.exist();
            expect(server).to.exist();
            internals.prepareServer(function (err, other) {

                expect(err).to.not.exist();
                expect(other).to.exist();
                done();
            });
        });
    });

    it('can handle null options in register()', function (done) {

        Poop.register({}, null, function (err) {

            expect(err).to.not.exist();
            done();
        });
    });
});


internals.prepareServer = function (callback) {

    var server = new Hapi.Server();

    server.connection();
    server.register({
        register: Poop,
        options: { logPath: internals.logPath }
    }, function (err) {

        expect(err).to.not.exist();
        callback(null, server);
    });
};


internals.countHeaps = function (callback) {

    Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

        if (err) {
            return callback(err);
        }

        var count = 0;

        for (var i = 0, il = files.length; i < il; ++i) {
            if (files[i].indexOf('heapdump-') === 0) {
                count++;
            }
        }

        return callback(null, count);
    });
};


internals.cleanup = function (callback) {

    Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

        if (err) {
            return callback(err);
        }

        for (var i = 0, il = files.length; i < il; ++i) {
            if (files[i].indexOf('heapdump-') === 0) {
                Fs.unlinkSync(Path.join(__dirname, '..', files[i]));
            }
        }

        return callback();
    });
};
