#!/usr/bin/env node
'use strict';

var logger = require('./lib/logger');
var program = require('commander');

/* Here come the core module of your command line app. Change this to something
* that really suit your needs. */
var core = require('./lib/core');

var pkg = require('./package.json');

program.version(pkg.version)
.option('-p, --port <n>', 'The port to which the server should listen to. Default: 3000', parseInt)
.option('-w, --watch [folder path]', 'The folder to watch for changes. Defaults to current directory', '.')
.option('-e, --endpoint [url]', 'The endpoint/server to redirect requests to. Default: http://localhost/endpoint', 'http://localhost/endpoint');

/* Hack the argv object so that commander thinks that this script is called
* 'pkg.name'. The help info will look nicer. */
process.argv[1] = pkg.name;
program.parse(process.argv);

logger.info(pkg.name + ' v' + pkg.version + program.port);
core.start({
    port: program.port || 3000,
    endpoint: program.endpoint,
    watch: program.watch,
}, function (err) {
    if (err) process.exit(1);
});
