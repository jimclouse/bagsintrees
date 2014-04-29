'use strict'
var redis = require("redis"), client = redis.createClient();
var request = require('request');
var CLIENT_ID = process.env['CLIENT_ID'];
var tagInfo = "https://api.instagram.com/v1/tags/bagsintrees?client_id=" + CLIENT_ID;
var allTags = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;

function getLogDate() {
  var d = new Date;
  return (d.getFullYear() + '-' + ('0' + d.getMonth()).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + d.toLocaleTimeString({hour: '2-digit', minute:'2-digit', second:'2-digit'}) + '\t');
}

/**
  actual worker method: downloads data from Instagram and saves to redis 
**/
function fetchBags() {
  console.log(getLogDate() + '*** Loading bags from Instagram');
  request({url: allTags, json: true}, function (err, response, body) {
      if (err) {
          console.error(getLogDate() + "get failed: " + err);
          return;
      }
      if (!err && response.statusCode == 200) {
          var data = body.data;
          for (var i = 0; i < data.length; i++) {
              var photo = data[i];
              if(photo.location) {
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
          console.log(getLogDate() + "Processed " + data.length + " bags");
      }
      client.end(); // close the redis connection
  });
}


/**
  main: Only do work if Redis is running
**/
client.PING(function(res) {
  if(res) {
    console.error(getLogDate() + "Unable to establish connection to redis server");
    client.end();
  }
  else {
    fetchBags();
  }
});