'use strict';

var _ = require('lodash');
var events = require('events');
var fs = require('fs');
var http = require('http');
var shell = require('shelljs');
var util = require('util');
var httpProxy = require('http-proxy');
var livereload = require('livereload');
var connect = require('connect');

// livereload port
var livereload_port;

var logger = require('./logger');

var Core = function () {
    events.EventEmitter.call(this);

    /* Set up the default options. */
    this.options = {
        port: 3000,
    };
};
util.inherits(Core, events.EventEmitter);

Core.prototype.start = function (options, callback) {
    var selects = [];
    var simpleselect = {};

    var livereload_port = 35729;
    var livereload_js = '\
    <script>\
    document.write(\'<script src="http://\' + (location.host ||\ \'localhost\').split(\':\')[0] +\
    \':' + livereload_port + '/livereload.js?snipver=1"></\' + \'script>\')\
    </script>\
    ';

    simpleselect.query = 'head';
    simpleselect.func = function (node) {
        var rs = node.createReadStream();
        var ws = node.createWriteStream({outer: false});

        // Read the node and put it back into our write stream,
        // but don't end the write stream when the readStream is closed.
        rs.pipe(ws, {end: false});

        // When the read stream has ended, attach our style to the end
        rs.on('end', function(){
            ws.end(livereload_js);
        });
    }

    selects.push(simpleselect);


    var _this = this;

    options = options || {};
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }

    this.options = _.defaults(options, this.options);

    callback = callback || function () {};

    // setup live reload
    var live_server = livereload.createServer({
        port: livereload_port,
    });
    live_server.watch(this.options.watch);

    // setup proxy
    var lively_server = connect();
    var proxy = httpProxy.createProxyServer({
        target: this.options.endpoint
    });

    //Additional true parameter can  be used to ignore js and css files.
    //app.use(require('../')([], selects, true));

    lively_server.use(require('harmon')([], selects, true));

    lively_server.use(function (req, res) {
        proxy.web(req, res);
    });



    http.createServer(lively_server)
    .listen(this.options.port, function (err) {
        if (!err) {
            logger.info('lively watching path: ' + _this.options.watch + ' with serving endpoint: ' + _this.options.endpoint + ' at port:' + _this.options.port);
        } else {
            logger.error('Could not start server on port ' + _this.options.port + '.');
            if (_this.options.port < 1000) {
                logger.error('Ports under 1000 require root privileges.');
            }

            logger.error(err.message);
        }

        callback(err);
    });
};

module.exports = new Core();
