var request             = require('request-promise');
var colors              = require('colors');
var q                   = require('q');
var _                   = require('underscore');
var mysqlClient         = require('./mysqlClient');
var log                 = require('./log');

var CLIENT_ID           = process.env.CLIENT_ID;
var TAG_SEARCH_URL      = "https://api.instagram.com/v1/tags/$tag$/media/recent?client_id=" + CLIENT_ID;
var ALLOWED_TAGS        = ['bagsintrees', 'bagremoved'];

var Promise             = require('bluebird');
var mysqlPromise        = Promise.promisify(mysqlClient.query2)
var rp                  = require('request-promise') 

/** 
  util method
**/
function mysqlStringScrub(str) {
  if(str) {
    return str.replace(/'/g, "''");
  }
  else 
    return str;
}

/**
  string scrubbing method for nullable columns
  add single quotes if a value, otherwise NULL 
**/
function dbStringFormat(str) {
  if (str) {
    return "'" + str + "'";
  }
  return "NULL";
}

/** 
  grep through caption and comments to find if bag has #bagRemoved tag
**/
function containsTag(photo, tag) {
  var i, comment;
  // check inital photo caption
  if (photo.caption && photo.caption.text && photo.caption.text.toLowerCase().indexOf("#" + tag) >= 0) {
    return true;
  }
  // check comments
  for (i = 0; i < photo.comments.data.length; i++) {
    comment = photo.comments.data[i];
    if (comment.text.toLowerCase().indexOf("#" + tag) >= 0) {
      return true;
    }
  }
  return false;
}

/**
  create a user object from the list
**/
function extractUser(userList, user) {
  userList[user.username] = {id: user.id, profilePicture: user.profile_picture};
}

/**
  fetch from Instagram
**/
function instagramFetch(url) {
  // if no url, we're done
  if (!url) {
    return Promise.resolve(null); 
  }
  log.info(("Fetching: " + url).blue);
  return rp({uri: url, json: true})
    .then(function(body) {
      log.info(("Success: Fetched " + body.data.length + " results").green);
      return body;
    })
}

/**
  Doer Function
**/
function dataHandler(tag, body) {
  var data = body.data;
  sql = "update settings set settingValue = " + body.pagination.min_tag_id + " where settingKey = 'min_tag_id_" + tag + "' and (" + body.pagination.min_tag_id + " > settingValue or settingValue is null);";
  return mysqlPromise(sql)
    .then(function (res) {
      log.info("Updated Min Tag Id to " + body.pagination.min_tag_id);
      return true
    })
    .then(function (res) {
        var bigSqlStr = "SET NAMES utf8mb4;"; // need this for emoji support
        var users = {};
        var i, photo, sql, key, userSql, userId;

        for (i = 0; i < data.length; i++) {
          photo = data[i];
          extractUser(users, photo.user);
          // exclude any that are videos or removes that arent related
          if (photo.type !== "image" || (tag === "bagremoved" && !containsTag(photo, "bagsintrees"))) {
            continue;
          }
          // work around for non-geo-tagged objects. set an empty location container on them
          if (!photo.location) {
            photo.location = {};
          }
          if (!photo.caption) {
            photo.caption = {}
          }
          
          sql = "insert into photos (id, created, thumbnailUrl, lowResUrl, hiReslUrl, latitude, longitude, locationName, userId, userName, caption) " +
                    " values ('#id#', '#created#', '#thumbnailUrl#', '#lowResUrl#', '#hiReslUrl#', #latitude#, #longitude#, #locationName#, '#userId#', '#userName#', #caption#) " +
                    " on duplicate key update caption = #caption#, locationName = #locationName#, latitude = #latitude#, longitude = #longitude#;";
          sql = sql.replace('#id#', photo.id)
                    .replace('#created#', photo.created_time)
                    .replace('#thumbnailUrl#', photo.images.thumbnail.url)
                    .replace('#lowResUrl#', photo.images.low_resolution.url)
                    .replace('#hiReslUrl#', photo.images.standard_resolution.url)
                    .replace(/#latitude#/g, dbStringFormat(photo.location.latitude))
                    .replace(/#longitude#/g, dbStringFormat(photo.location.longitude))
                    .replace(/#locationName#/g, dbStringFormat(mysqlStringScrub(photo.location.name)))
                    .replace('#userId#', photo.user.id)
                    .replace('#userName#', photo.user.username)
                    .replace(/#caption#/g, dbStringFormat(mysqlStringScrub(photo.caption.text)));

          bigSqlStr = (bigSqlStr + sql);
          // extract comments
          if (photo.comments && photo.comments.data) {
            _.each(photo.comments.data, function (comment) {
              extractUser(users, comment.from);
              sql = "insert into comments (photoId, comment, created, userId) " +
                        "values ('" + photo.id + "', '" + mysqlStringScrub(comment.text) + "', '" + comment.created_time + "', '" + comment.from.id + "')" +
                        " on duplicate key update comment = '" + mysqlStringScrub(comment.text) + "';";
              bigSqlStr = (bigSqlStr + sql);
            });
          }
          // look for removed bags
          if (containsTag(photo, "bagremoved")) {
            sql = "update photos set isRemoved = 1 where id = '" + photo.id + "';";
            bigSqlStr = (bigSqlStr + sql);
          }
        }

        // process the users into statements
        userSql = "";
        for (key in users) {
          userId = users[key];
          userSql = userSql + "insert into users (id, name, profilePicture) values ('" + userId.id + "', '" + key + "', '" + userId.profilePicture + "') on duplicate key update name = '" + key + "', profilePicture = '" + userId.profilePicture + "';";
        }

      // log.debug("--------------------");
      // log.debug(userSql);
      // log.debug("--------------------");
      // log.debug(bigSqlStr);
      return mysqlPromise(userSql + bigSqlStr);
    })
    .then(function (res) {
      // log.debug("---- Mysql Response ----");
      // log.debug(res);
      return;
    });    
}

/** 
  Promise Loop Worker
**/
var promiseWhile = function(tag, condition, action) {
  log.info(('*** Loading bags from Instagram for #' + tag).blue);
  var url = TAG_SEARCH_URL.replace('$tag$', tag);
  // Start by getting the min tag id we have in the db, if any
  return mysqlPromise("select settingValue as min_tag_id from settings where settingKey = 'min_tag_id_" + tag + "';")
    .then(function (res) {
      if (res && res[0]) {
        var url = TAG_SEARCH_URL.replace('$tag$', tag);
        if (res[0].min_tag_id) {
          log.info("Found min tag id " + res[0].min_tag_id);
          url = url + '&min_tag_id=' + res[0].min_tag_id;
        }
      }
      return url
    })
    .then(function(url) {
      var resolver = Promise.defer();
      var loop = function() {
        return condition(url)
        .then(function(body){
          log.debug("Data returned from IG");
          
          if (!(body && body.data && body.data.length)) {
            log.info("Nothing more to fetch. Quitting.");
            return resolver.resolve(); // get out if no more results
          }

          // Add in url manipulation here
          if (body.pagination && body.pagination.next_url) {
            url = body.pagination.next_url;
          }
          else {
            url = null; // signal to condition method not to hit instagram
          }

          return Promise.cast(action(tag, body))
            .then(loop)
            .catch(function (e) {
              return resolver.reject(e);
            });
        })
        .catch(function (e) {
          return resolver.reject(e);
        });    
      };

      process.nextTick(loop);
      return resolver.promise;
     });
};


/** 
  Main method
**/
function fetch (tag, cb) {
  promiseWhile(tag, instagramFetch, dataHandler)
  .then(function() {
    log.debug('Complete. Success.');
    if (cb) cb(tag);
    else process.exit(0);
  })
  .error( function (err) {
    try {
      log.error(err.toString().red);
    }
    catch (e) {
      log.error("Exception caught");
      console.log(err);
      log.error(err);
    }
    if (cb) cb(e);
    else process.exit(1);
  });
};

exports.fetch = fetch;



