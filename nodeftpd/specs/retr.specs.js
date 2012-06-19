require('should');
var ftpd = require('../ftpd'), Ftp = require("jsftp"), fs = require("fs");


describe('RETR ftpd command', function(){
    var ftp, server;

    beforeEach(function(done){
        server = ftpd.createServer("127.0.0.1", fs.realpathSync(__dirname + '/../fixture'));
        server.on("client:connected", function(socket) {
            var username;
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
        server.listen(2021);
        ftp = new Ftp({
            host: "127.0.0.1",
            port: 2021
        });
        ftp.auth("jose", "esoj", function(err, res) {
            done();
        });
    });

    it("should send a 150 changing mode before sending the content", function(done){
        var messages=[];
        ftp.socket.on("data", function(d){
            messages.push(d);
        });
        ftp.setPassive({
            mode: "A",
            cmd: "RETR " + "/data.txt",
            pasvCallback: function(err, buffer){
                messages[3].should.eql("150 Opening ASCII mode data connection\r\n");
                done();
            }
        });
    });
    
    afterEach(function(){
        server.close();
    });
});