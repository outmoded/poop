var Hapi = require('hapi');

process.on('message', function (pluginOptions) {

    var server = new Hapi.Server();
    server.connection();
    server.register({
        register: require('../'),
        options: pluginOptions
    }, function (error) {

        process.send(error);
        process.emit('uncaughtException', new Error('test'));
    });
});
