var request             = require('request');
var colors              = require('colors');
var q                   = require('q');
var _                   = require('underscore');
var mysqlClient         = require('./mysqlClient');
var log                 = require('./log');

var CLIENT_ID           = process.env['CLIENT_ID'];
var TAG_SEARCH_URL      = "https://api.instagram.com/v1/tags/$tag$/media/recent?client_id=" + CLIENT_ID;

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
  grep through caption and comments to find if bag has #bagRemoved tag
**/
function containsTag(photo, tag) {
  // check inital photo caption
  if (photo.caption.text.toLowerCase().indexOf("#" + tag) >= 0) {
    return true;
  }
  // check comments
  for (var i = 0; i < photo.comments.data.length; i++) {
    comment = photo.comments.data[i];
    
    if (comment.text.toLowerCase().indexOf("#" + tag) >= 0) {
      return true;
    }
  }
  return false;
}

/**
  controller method starts the download.
**/
function fetch(tag, cb) {
  if(!mysqlClient) {
    return "Mysql Not Connected";
  }

  log.info(('*** Loading bags from Instagram for #' + tag).blue);

  mysqlClient.query("select settingValue as min_tag_id from settings where settingKey = 'min_tag_id';",
    function(rows, err) {
      if(err) {
       return err;
      }

      var url = TAG_SEARCH_URL.replace('$tag$', tag);
      if(rows[0].min_tag_id) {
        log.info("Found min tag id " + rows[0].min_tag_id);
        url = url + '&min_tag_id=' + rows[0].min_tag_id;
      }
      processBags(url, tag)
      .then(function() {
        log.info("Finishing up...");
        cb("Finished.");
      }).catch(function(err) {
        log.error("Had an exception " + err);
        cb(err);
      });
  });
}

/**
  fetch from Instagram
**/
function instagramFetch(url) {
  var d = q.defer();
  log.info(("Fetching: " + url).blue)
  request({url: url, json: true}, function (err, response, body) {
    if (err) {
      log.error("ERROR: Instagram API Get failed!".red);
      d.reject("ERROR: (" + body.meta.code + ") " + body.meta.error_type + "; " + body.meta.error_message);
    }
    if (!err && response.statusCode == 200) {
      log.info(("Success: Fetched " + body.data.length + " results").green);
      d.resolve(body);
    }
  });
  return d.promise;
}

function extractUser(userList, user) {
  userList[user.username] = {id: user.id, profilePicture: user.profile_picture};
}
/** 
  actual worker method: downloads data from Instagram and saves to mysql 
  if multiple pages, gets them all
**/
function processBags(url, tag) {
  var d = q.defer();

  instagramFetch(url)
  .then( function(body) {
    // get out if nothing to fetch
    if(!body.data.length) {
      log.info("Nothing to Fetch. Quitting.");
      return d.resolve();
    }
    var data = body.data 
    mysqlClient.query("update settings set settingValue = " + body.pagination.min_tag_id + " where settingKey = 'min_tag_id' and (" + body.pagination.min_tag_id + " > settingValue or settingValue is null);", function(rows, err) {
      if(err) {
        return d.reject(err);
      }
      
      log.info("Updated Min Tag Id to " + body.pagination.min_tag_id)
    
      var bigSqlStr = "";
      var users = {};
      for (var i = 0; i < data.length; i++) {
        var photo = data[i];
        extractUser(users, photo.user);
        // exclude any without geotags or that are videos or removes that arent related
        if(!photo.location || photo.type !== "image" || (tag == "bagremoved" && !containsTag(photo, "bagsintrees"))) {
          continue;
        }

        var sql = "insert into photos (id, created, thumbnailUrl, lowResUrl, hiReslUrl, latitude, longitude, locationName, userId, userName, caption) " +
                  " values ('" + photo.id + "', '" + photo.created_time + "', '" + photo.images.thumbnail.url +
                  "', '" + photo.images.low_resolution.url + "', '" + photo.images.standard_resolution.url + "', '" + 
                  photo.location.latitude + "', '" + photo.location.longitude + "', " + dbStringFormat(photo.location.name) + ", " +
                  photo.user.id + ", '" + photo.user.username + "', '" + mysqlStringScrub(photo.caption.text) + "') " + 
                  " on duplicate key update caption = '" + mysqlStringScrub(photo.caption.text) + "';"

        bigSqlStr = (bigSqlStr + sql);
        // extract comments
        if (photo.comments && photo.comments.data) {
          _.each(photo.comments.data, function(comment) {
            extractUser(users, comment.from);
            var sql = "insert into comments (photoId, comment, created, userId) " +
                      "values ('" + photo.id + "', '" + mysqlStringScrub(comment.text) + "', '" + comment.created_time + "', '" + comment.from.id + "')" + 
                      " on duplicate key update comment = '" + mysqlStringScrub(comment.text) + "';"
            bigSqlStr = (bigSqlStr + sql);
          });
        }
        // look for removed bags
        if (containsTag(photo, "bagremoved")) {
          var sql = "update photos set isRemoved = 1 where id = '" + photo.id + "';"
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
            log.error("ERROR: " + err);
            d.reject(err);
          }
          log.info(("Processed " + data.length + " bags").green);

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
    log.error("Error: " + err);
    d.reject(err);
  });

  return d.promise;
}

exports.fetch = fetch;

