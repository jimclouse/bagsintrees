'use strict'
var path = require('path');
var redis = require("redis"), client = redis.createClient();
var engines = require('consolidate');
var _ = require('underscore');
var express = require('express');

var app = express();
app.set('root', process.cwd()) // Need this to find the project root directory

app.configure(function(){
    console.log(app.get("root") + '/public/img/favicon.ico');
    app.use(express.favicon(app.get("root") + '/public/img/favicon.ico'));
    app.engine('html', engines.mustache);
    app.use(express.static(app.get("root") + '/public'));
    app.use('/bower_components',  express.static(app.get("root") + '/bower_components'));
    app.use('/node_modules',  express.static(app.get("root") + '/node_modules'));
    app.use(app.router);

});

// main site route
app.get('/', function(req, res) {
    res.render('index.html', {});
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

var server = app.listen(3001, function() {
    console.log('#BagsInTrees now listening to the rustle of plastic on port %d', server.address().port);
});
