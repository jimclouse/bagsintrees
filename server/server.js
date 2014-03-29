'use strict'
// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello World\n');
// }).listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');

var express = require('express');
var app = express();

app.get('/load/all', function(req, res){
    var request = require('request');
    var CLIENT_ID = process.env['CLIENT_ID'];
    var tagInfo = "https://api.instagram.com/v1/tags/bagsintrees?client_id=" + CLIENT_ID;
    var allTags = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;

    request(tagInfo, function (err, response, body) {
        if (err) {
            return console.error('get failed:', err);
        }
        if (!err && response.statusCode == 200) {
            console.log("OK")
            console.log(body)
        }
    })
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});