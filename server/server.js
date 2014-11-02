'use strict'
var path = require('path');
var fetchBags = require('./fetchBags');
var redis = require("redis"), client = redis.createClient();
var engines = require('consolidate');
var _ = require('underscore');
var express = require('express');
var colors = require('colors');

/* get the port situated based on environment */
if (process.env['ENVIRONMENT'] == "production") {
    var _port = 8080;
}
else {
    var _port = 3011;
}

console.log(("Configuring app to use port: " + _port).green);

var app = express();
app.set('root', process.cwd()) // Need this to find the project root directory

app.configure(function() {
    app.use(express.favicon(app.get("root") + '/public/img/favicon.ico'));
    app.use('/node_modules',  express.static(app.get("root") + '/node_modules'));
    app.use('/bower_components',  express.static(app.get("root") + '/bower_components'));
    app.use(express.static(app.get("root") + '/public'));
    app.use(express.json());       // to support JSON-encoded bodies
    app.use(express.urlencoded()); // to support URL-encoded bodies
});

// route for setting up instagram subscription
app.get('/igrm/newbag', function(req, res) {
    res.send(req.query['hub.challenge']);
});

// route for setting up instagram subscription
app.post('/igrm/newbag', function(req, res) {
    setTimeout(function() {
        fetchBags.fetch();    
        console.log("done");
    }, 10);
    res.send('OK');
});

// client routes
app.get('/bags/all', function(req, res) {
    client.zrevrange(["pics", 0, 150], function (err, keys) {
        if (err) {
            return console.error("error response - " + err);
        }
        client.mget(keys, function(err, obj) {
            res.send(_.map(obj, function(val) {
                        return JSON.parse(val);
            }));
        });
    });
});

app.get('/bags/one/:id', function(req, res) {
    var key = "p:" + req.params.id;
    client.mget(key, function(err, obj) {
        res.send(_.map(obj, function(val) {
                    return JSON.parse(val);
        }));
    });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.redirect('/#/404');
});

var server = app.listen(_port, function() {
    console.log('#BagsInTrees now listening to the rustle of plastic on port %d'.green, server.address().port);
});
