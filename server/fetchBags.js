'use strict'
var redis = require("redis");
var request = require('request');
var colors = require('colors');
var CLIENT_ID = process.env['CLIENT_ID'];
var tagUrl = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;
var client;

function getLogDate() {
  var d = new Date;
  return (d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + d.toLocaleTimeString({hour: '2-digit', minute:'2-digit', second:'2-digit'}) + '\t');
}

/**
  controller method starts the download.
**/
function fetch() {
  client = redis.createClient();
  console.log((getLogDate() + '*** Loading bags from Instagram').blue);
  client.GET("min_tag_id", function(err, reply) {
    var url = tagUrl;
    if(reply) {
      url = url + '&min_tag_id=' + reply;
    }
    processBags(url);
  });
}
exports.fetch = fetch;

/** 
  actual worker method: downloads data from Instagram and saves to redis 
  if multiple pages, gets them all
**/
function processBags(url) {
  console.log(("FETCHING: " + url).blue)
  request({url: url, json: true}, function (err, response, body) {
    if (err) {
        console.log((getLogDate() + "get failed: " + err).red);
        client.end();
    }

    if (!err && response.statusCode == 200) {
        console.log(("SUCCESS: Fetched " + body.data.length + " results").green);
        var data = body.data;
        client.SET("min_tag_id", body.pagination.min_tag_id);

        for (var i = 0; i < data.length; i++) {
            var photo = data[i];
            if(photo.location && photo.type == "image") {
                client.SET("p:" + photo.id, JSON.stringify({
                                              "id": photo.id,
                                              "created" : photo.created_time,
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
        console.log((getLogDate() + "Processed " + data.length + " bags").green);
    }
    else {
      console.log("ERROR: Instagram API Get failed!".red);
      console.log("ERROR: (" + body.meta.code + ") " + body.meta.error_type + "; " + body.meta.error_message);
    }

    //recurse process bags if there is another
    if(body.pagination && body.pagination.next_url) {
      processBags(body.pagination.next_url)
    }          

    client.end(); // close the redis connection
  });
}

/**
  main: Only do work if Redis is running
**/
// client.PING(function(res) {
//   if(res) {
//     console.error(getLogDate() + "Unable to establish connection to redis server");
//     client.end();
//   }
//   else {
//     //fetch();
//   }
// });