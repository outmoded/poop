'use strict';

// Load modules

const Fs = require('fs');
const Os = require('os');
const Path = require('path');
const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Teamwork = require('teamwork');
const Poop = require('../lib');
const PoopUtils = require('../lib/utils');


// Declare internals

const internals = {
    logPath: Path.join(__dirname, 'test.log')
};


// Test shortcuts

const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const expect = Code.expect;


describe('Poop', () => {

    lab.afterEach(() => {

        internals.cleanup();
    });

    it('logs uncaught exceptions, takes dump, and exits process', async () => {

        const team = new Teamwork();
        const orig = process.exit;

        process.removeAllListeners('uncaughtException');
        await internals.prepareServer();
        process.exit = function (code) {

            process.exit = orig;
            expect(code).to.equal(1);

            const exception = JSON.parse(Fs.readFileSync(internals.logPath, 'utf8'));

            expect(exception.message).to.equal('test');
            expect(exception.stack).to.be.a.string();
            expect(exception.timestamp).to.be.a.number();
            Fs.unlinkSync(internals.logPath);
            expect(internals.countHeaps()).to.equal(1);
            team.attend();
        };

        process.emit('uncaughtException', new Error('test'));
        await team.work;
    });

    it('takes dump on SIGUSR1 events', async () => {

        await internals.prepareServer();
        process.emit('SIGUSR1');
        expect(internals.countHeaps()).to.equal(1);
    });

    it('configures the the log file', async () => {

        const err1 = new Error('test 1');
        const err2 = new Error('test 2');
        const options = {
            logPath: Path.join(__dirname, 'config.log'),
            writeStreamOptions: { flags: 'a' }
        };

        await PoopUtils.log(err1, options);
        await PoopUtils.log(err2, options);

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
    });

    it('can register the plugin multiple times', async () => {

        const server1 = await internals.prepareServer();
        expect(server1).to.exist();
        const server2 = await internals.prepareServer();
        expect(server2).to.exist();
    });

    it('can handle null options in register()', () => {

        expect(() => {

            Poop.register({}, null);
        }).to.not.throw();
    });
});


internals.prepareServer = async function () {

    const server = Hapi.server();

    await server.register({
        plugin: Poop,
        options: { logPath: internals.logPath }
    });

    return server;
};


internals.countHeaps = function () {

    const files = Fs.readdirSync(process.cwd());
    let count = 0;

    for (let i = 0; i < files.length; ++i) {
        if (files[i].indexOf('heapdump-') === 0) {
            count++;
        }
    }

    return count;
};


internals.cleanup = function () {

    const files = Fs.readdirSync(process.cwd());

    for (let i = 0; i < files.length; ++i) {
        if (files[i].indexOf('heapdump-') === 0) {
            Fs.unlinkSync(Path.join(process.cwd(), files[i]));
        }
    }
};
