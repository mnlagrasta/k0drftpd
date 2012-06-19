var ftpd = require('./nodeftpd/ftpd.js');
var fs = require('fs');
var PathModule = require("path");

var nopt = require("nopt"),
  Stream = require("stream").Stream
  , path = require("path")
  , knownOpts = { "root" : path
                , "user" : [String, Array]
                , "mkdir" : Boolean
                , "debug" : Number
                , "port" : Number
                , "help" : Boolean
                }
  , shortHands = { "p" : ["--port"]
                 , "u" : ["--user"]
                 , "m" : ["--mkdir"]
                 , "r" : ["--root"]
                 , "d" : ["--debug"]
                 , "h" : ["--help"]
                 }
  , parsed = nopt(knownOpts, shortHands);

var helpText = "Bare minimal FTP server\n\
Usage:\n\tnode server.js [options] \n\
Options:\n\
\tAll of the following options have single letter equivalents. (-p for --port)\n\
\t--root path\tPath to be used as the ftp root. Defaults to current dir.\n\
\t--port port\tPort to be listen on. Defaults to 21 (which may require sudo).\n\
\t--debug number\tDebug Level (0-3). Outputs logging info. Default is 0.\n\
\t--help     \tThis very useful message. ;)\n\
\n\
Examples:\n\
\tsudo node server.js\n\
\t(starts the ftp server on port 21 and usees the current dir as the ftp root)\n\n\
\tnode server.js -p 7001 -r /tmp/ftpd\n\
\t(listen on port 7001 and save files to /tmp/ftpd)\n\
";
if (parsed['help']) {
    console.log(helpText);
    process.exit();
}

var root = parsed['path'] || process.cwd();
var userlist = parsed['user'];
var debug = parsed['debug'] || 0;
var port = parsed['port'] || 21;


var ftp_server = ftpd.createServer("127.0.0.1", root);
ftp_server.on("client:connected", function(socket) {
    var username = null;
    socket.on("command:user", function(user, success, failure) {
        if (user) {
            username = user;
            success();
        } else failure();
    });

    socket.on("command:pass", function(pass, success, failure) {
        if (pass) success(username);
        else failure();
    });
    
});
ftp_server.debugging = debug;
ftp_server.listen(port);
