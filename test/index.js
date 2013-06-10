// Load modules

var Lab = require('lab');
var Fs = require('fs');
var Hapi = require('hapi');
var Path = require('path');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('Poop', function () {

    after(function (done) {

        Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

            var heaps = 0;
            for (var i = 0, il = files.length; i < il; ++i) {
                if (files[i].indexOf('heapdump-') === 0) {
                    heaps++;
                    Fs.unlinkSync(Path.join(__dirname, '..', files[i]));
                }
            }

            expect(heaps).to.equal(4);
            done();
        });
    });

    it('can be included as a plugin', function (done) {

        var server = new Hapi.Server();
        server.pack.require('../', function (err) {

            expect(err).to.not.exist;
            process.removeAllListeners('uncaughtException');
            done();
        });
    });

    it('can log uncaught exceptions to the file provided and exits process', function (done) {

        var logPath = __dirname + '/test1.log';
        var server = new Hapi.Server();
        server.pack.require('../', { logPath: logPath }, function (err) {

            expect(err).to.not.exist;
            var exit = process.exit;

            process.exit = function (code) {

                expect(code).to.equal(1);
                expect(Fs.existsSync(logPath));
                Fs.unlinkSync(logPath);
                process.exit = exit;

                done();
            };

            process.emit('uncaughtException', new Error('test'));
        });
    });

    it('can handle SIGUSR2 events', function (done) {

        Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

            var heapsBefore = 0;
            for (var i = 0, il = files.length; i < il; ++i) {
                if (files[i].indexOf('heapdump-') === 0) {
                    heapsBefore++;
                }
            }

            var server = new Hapi.Server();
            server.pack.require('../', function (err) {

                expect(err).to.not.exist;
                process.removeAllListeners('uncaughtException');
                process.emit('SIGUSR2');

                Fs.readdir(Path.join(__dirname, '..'), function (err, files) {

                    var heapsAfter = 0;
                    for (var i = 0, il = files.length; i < il; ++i) {
                        if (files[i].indexOf('heapdump-') === 0) {
                            heapsAfter++;
                        }
                    }

                    expect(heapsAfter - heapsBefore).to.be.greaterThan(1);
                    done();
                });
            });
        });

    });
});