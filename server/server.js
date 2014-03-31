'use strict'

var express = require('express');
var app = express();
var redis = require("redis"), client = redis.createClient();

app.get('/load/all', function(req, res){
    var request = require('request');
    var CLIENT_ID = process.env['CLIENT_ID'];
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
                if(!photo.location) {console.log(photo)}
                else {
                    client.HMSET("p:" + photo.id, {"created" : photo.created_time,
                                                   "thumbnail_url": photo.images.thumbnail.url,
                                                   "low_res_url": photo.images.low_resolution.url,
                                                   "latitude": photo.location.latitude,
                                                   "longitude": photo.location.longitude,
                                               });
                }
            }  
        }

    })
});

app.get('/bags/all', function(req, res) {
    client.keys("p:*", function (err, photos) {
        if (err) {
            return console.error("error response - " + err);
        }

        for (var j = 0; j < photos.length; j++) {
            var photo = photos[j];
            client.HGETALL(photo, function(err, obj) {
                res.send(photo + " - " + JSON.stringify(obj));
            });
        }
    });  
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});




