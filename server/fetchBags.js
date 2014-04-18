'use strict'
var redis = require("redis"), client = redis.createClient();

console.log("Loading bags from Instagram");

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
        console.log("Processing downloaded bags");
        for (var i = 0; i < data.length; i++) {
            var photo = data[i];
            if(photo.location) {
                client.SET("p:" + photo.id, JSON.stringify({"created" : photo.created_time,
                                               "thumbnail_url": photo.images.thumbnail.url,
                                               "low_res_url": photo.images.low_resolution.url,
                                               "latitude": photo.location.latitude,
                                               "longitude": photo.location.longitude,
                                               "user": photo.user.username,
                                               "caption": photo.caption.text
                                           }));
                client.ZADD('pics', photo.created_time, "p:" + photo.id);
            }
        }
        console.log("Processed " + data.length + " bags");
    }
    client.end(); // close the redis connection
});