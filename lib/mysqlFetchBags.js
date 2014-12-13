'use strict'
var request = require('request');
var colors = require('colors');
var q = require('q')
var _ = require('underscore')
var CLIENT_ID = process.env['CLIENT_ID'];
var tagUrl = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;

var mysqlClient     = require('./mysqlClient');

/**
  helper method for log formatting 
**/
function getLogDate() {
  var d = new Date;
  return (d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + d.toLocaleTimeString({hour: '2-digit', minute:'2-digit', second:'2-digit'}) + '\t');
}

/** 
  util method
**/
function mysqlStringScrub(str) {
  return str.replace(/'/g, "''");
}

/**
  string scrubbing method for nullable columns
  add single quotes if a value, otherwise NULL 
**/
function dbStringFormat(str) {
  if(str) {
    return "'" + str + "'";
  }
  return "NULL";
}

/**
  controller method starts the download.
**/
function fetch(cb) {
  if(!mysqlClient) {
    return "Mysql Not Connected"
  }

  console.log((getLogDate() + '*** Loading bags from Instagram').blue);

  mysqlClient.query("select settingValue as min_tag_id from settings where settingKey = 'min_tag_id';",
    function(rows, err) {
      if(err) {
       return err;
      }

      var url = tagUrl;
      if(rows[0].min_tag_id) {
        console.log(getLogDate() + "Found min tag id " + rows[0].min_tag_id);
        url = url + '&min_tag_id=' + rows[0].min_tag_id;
      }
      processBags(url)
      .then(function() {
        console.log(getLogDate() + "Finishing up...");
        cb("Finished.");
      }).catch(function(err) {
        console.log(getLogDate() + "Had an exception " + err);
        cb(err);
      });
  });
}
exports.fetch = fetch;


/**
  fetch from Instagram
**/
function instagramFetch(url) {
  var d = q.defer();
  console.log((getLogDate() + "Fetching: " + url).blue)
  request({url: url, json: true}, function (err, response, body) {
    if (err) {
      console.log(getLogDate() + "ERROR: Instagram API Get failed!".red);
      d.reject("ERROR: (" + body.meta.code + ") " + body.meta.error_type + "; " + body.meta.error_message);
    }
    if (!err && response.statusCode == 200) {
      console.log((getLogDate() + "Success: Fetched " + body.data.length + " results").green);
      d.resolve(body);
    }
  });
  return d.promise;
}

/** 
  actual worker method: downloads data from Instagram and saves to mysql 
  if multiple pages, gets them all
**/
function processBags(url) {
  var d = q.defer();

  instagramFetch(url)
  .then( function(body) {
    // get out if nothing to fetch
    if(!body.data.length) {
      console.log(getLogDate() + "Nothing to Fetch. Quitting.");
      return d.resolve();
    }
    var data = body.data 
    mysqlClient.query("update settings set settingValue = " + body.pagination.min_tag_id + " where settingKey = 'min_tag_id' and (" + body.pagination.min_tag_id + " > settingValue or settingValue is null);", function(rows, err) {
      if(err) {
        return d.reject(err);
      }
      
      console.log(getLogDate() + "Updated Min Tag Id to " + body.pagination.min_tag_id)
    
      var bigSqlStr = "";
      var users = {};
      for (var i = 0; i < data.length; i++) {
        var photo = data[i];
        users[photo.user.username] = {id: photo.user.id, profilePicture: photo.user.profile_picture};
        if(photo.location && photo.type == "image") {
            var sql = "insert into photos (id, created, thumbnailUrl, lowResUrl, hiReslUrl, latitude, longitude, locationName, userId, userName, caption) " +
                      " values ('" + photo.id + "', '" + photo.created_time + "', '" + photo.images.thumbnail.url +
                      "', '" + photo.images.low_resolution.url + "', '" + photo.images.standard_resolution.url + "', '" + 
                      photo.location.latitude + "', '" + photo.location.longitude + "', " + dbStringFormat(photo.location.name) + ", " +
                      photo.user.id + ", '" + photo.user.username + "', '" + mysqlStringScrub(photo.caption.text) + "');"

            bigSqlStr = (bigSqlStr + sql);
        }
      }

      // process the users into statements
      var userSql = "";
      for(var key in users) {
          var val = users[key];
          userSql = userSql + "insert into users (id, name, profilePicture) values ('" + val.id + "', '" + key + "', '" + val.profilePicture + "') on duplicate key update name = '" + key + "', profilePicture = '" + val.profilePicture + "';"
      }

      if(bigSqlStr !== "") {
        mysqlClient.query(userSql + bigSqlStr, function(rows) {
          if(err) {
            console.log("ERROR: " + err);
            d.reject(err);
          }
          console.log((getLogDate() + "Processed " + data.length + " bags").green);

          //recurse process bags if there is another
          if(body.pagination && body.pagination.next_url) {
            
            return processBags(body.pagination.next_url).then (function() {
              d.resolve();
            })
          }
          else {
            return d.resolve();
          }
        });
      }
    }); // end of outer query 
  })  
  .catch(function(err) {
    console.log("in error")
    d.reject(err);
  });

  return d.promise;
}
