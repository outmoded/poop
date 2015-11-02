'use strict';

// Load modules

const Fs = require('fs');
const Os = require('os');
const Path = require('path');
const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Poop = require('../lib');
const PoopUtils = require('../lib/utils');


// Declare internals

const internals = {
    logPath: Path.join(__dirname, 'test.log')
};


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;


describe('Poop', () => {

    lab.afterEach((done) => {

        internals.cleanup(done);
    });

    it('logs uncaught exceptions, takes dump, and exits process', (done) => {

        internals.prepareServer((err, server) => {

            const orig = process.exit;

            process.exit = function (code) {

                process.exit = orig;
                expect(code).to.equal(1);

                const exception = JSON.parse(Fs.readFileSync(internals.logPath, 'utf8'));

                expect(exception.message).to.equal('test');
                expect(exception.stack).to.be.a.string();
                expect(exception.timestamp).to.be.a.number();
                Fs.unlinkSync(internals.logPath);
                internals.countHeaps((err, count) => {

                    expect(err).to.not.exist();
                    expect(count).to.equal(1);
                    done();
                });
            };

            process.emit('uncaughtException', new Error('test'));
        });
    });

    it('takes dump on SIGUSR1 events', (done) => {

        internals.prepareServer((err, server) => {

            expect(err).to.not.exist();
            process.emit('SIGUSR1');
            internals.countHeaps((err, count) => {

                expect(err).to.not.exist();
                expect(count).to.equal(1);
                done();
            });
        });
    });

    it('configures the the log file', (done) => {

        const err1 = new Error('test 1');
        const err2 = new Error('test 2');
        const options = {
            logPath: Path.join(__dirname, 'config.log'),
            writeStreamOptions: { flags: 'a' }
        };

        PoopUtils.log(err1, options, () => {

            PoopUtils.log(err2, options, () => {

                const exceptions = Fs.readFileSync(options.logPath, 'utf8').split(Os.EOL);
                const ex1 = JSON.parse(exceptions[0]);
                const ex2 = JSON.parse(exceptions[1]);

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

    it('can register the plugin multiple times', (done) => {

        internals.prepareServer((err, server) => {

            expect(err).to.not.exist();
            expect(server).to.exist();
            internals.prepareServer((err, other) => {

                expect(err).to.not.exist();
                expect(other).to.exist();
                done();
            });
        });
    });

    it('can handle null options in register()', (done) => {

        Poop.register({}, null, (err) => {

            expect(err).to.not.exist();
            done();
        });
    });
});


internals.prepareServer = function (callback) {

    const server = new Hapi.Server();

    server.connection();
    server.register({
        register: Poop,
        options: { logPath: internals.logPath }
    }, (err) => {

        expect(err).to.not.exist();
        callback(null, server);
    });
};


internals.countHeaps = function (callback) {

    Fs.readdir(process.cwd(), (err, files) => {

        if (err) {
            return callback(err);
        }

        let count = 0;

        for (let i = 0; i < files.length; ++i) {
            if (files[i].indexOf('heapdump-') === 0) {
                count++;
            }
        }

        return callback(null, count);
    });
};


internals.cleanup = function (callback) {

    Fs.readdir(process.cwd(), (err, files) => {

        if (err) {
            return callback(err);
        }

        for (let i = 0; i < files.length; ++i) {
            if (files[i].indexOf('heapdump-') === 0) {
                Fs.unlinkSync(Path.join(process.cwd(), files[i]));
            }
        }

        return callback();
    });
};
