var livereload = require('livereload');

var server = livereload.createServer({
    originalPath: "http://localhost/sms"
});
server.watch('/home/error-404/code/sms-remarketing/');
