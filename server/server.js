'use strict'
var path = require('path');
var redis = require("redis"), client = redis.createClient();
var engines = require('consolidate');
var _ = require('underscore');
var express = require('express');

var app = express();
app.set('root', process.cwd()) // Need this to find the project root directory

app.configure(function(){
    app.engine('html', engines.mustache);
    app.use(express.static(app.get("root") + '/public'));
    app.use('/bower_components',  express.static(app.get("root") + '/bower_components'));
    app.use(app.router)
});

app.post('/load/all', function(req, res){
    var request = require('request');
    var CLIENT_ID = "02d4b5e6622e4a118d0f3828b72eb6bd" //process.env['CLIENT_ID'];
    var tagInfo = "https://api.instagram.com/v1/tags/bagsintrees?client_id=" + CLIENT_ID;
    var allTags = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;

    request({url: allTags, json: true}, function (err, response, body) {
        if (err) {
            return console.error('get failed:', err);
        }

        if (!err && response.statusCode == 200) {
            var data = body.data;
            for (var i = 0; i < data.length; i++) {
                var photo = data[i];
                if(photo.location) {
                    client.SET("p:" + photo.id, JSON.stringify({"created" : photo.created_time,
                                                   "thumbnail_url": photo.images.thumbnail.url,
                                                   "low_res_url": photo.images.low_resolution.url,
                                                   "latitude": photo.location.latitude,
                                                   "longitude": photo.location.longitude,
                                               }));
                    client.ZADD('pics', photo.created_time, "p:" + photo.id);
                }
            }  
        }

    })
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
