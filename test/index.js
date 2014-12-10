// Load modules

var Code = require('code');
var Lab = require('lab');
var Fs = require('fs');
var Hapi = require('hapi');
var Path = require('path');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;


var logPath = __dirname + '/test1.log';
var server;
before(function (done) {

    server = new Hapi.Server();
    server.connection();
    server.register({
        register: require('../'),
        options: { logPath: logPath }
    }, function (err) {

        expect(err).to.not.exist();
        var other = new Hapi.Server();
        other.connection();
        other.register({
            register: require('../'),
            options: { logPath: logPath }
        }, function (err) {

            expect(err).to.not.exist();
            done();
        });
    });
});

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

it('can log uncaught exceptions to the file provided and exits process', function (done) {

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
