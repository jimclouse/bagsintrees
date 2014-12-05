'use strict'
var request = require('request');
var colors = require('colors');
var q = require('q')
var CLIENT_ID = process.env['CLIENT_ID'];
var tagUrl = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;
var client;


var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'bags',
  password : 'query4Bag$',
  database : 'bagsintrees'
});

/**
connect to db
**/
function connect() {
  var d = q.defer();
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return d.reject(err);
    }

    console.log('mysql connected as id ' + connection.threadId);
    return d.resolve(true);
  });
  return d.promise;
}
/**
  performs a promise query against the database
**/
function query(sql) {
  var d = q.defer();
  console.log('in query: ' + sql);
  connection.query(sql, function(err, rows, fields) {
    if (err) d.reject(err);
    d.resolve(rows);
  })
  return d.promise;
} 

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
  controller method starts the download.
**/
function fetch() {
  return connect().then( function() {

    console.log((getLogDate() + '*** Loading bags from Instagram').blue);

    return query("select settingValue as min_tag_id from settings where settingKey = 'min_tag_id';")
    .then(function(rows) {
      console.log("got min tag id");
      var url = tagUrl;
      if(rows[0].min_tag_id) {
        url = url + '&min_tag_id=' + rows[0].min_tag_id;
      }
      return processBags(client, url)
        .then(function() {
          console.log("closing mysql client");
          
          connection.end();
        });
    });  
  });
}
exports.fetch = fetch;


/** 
  actual worker method: downloads data from Instagram and saves to redis 
  if multiple pages, gets them all
**/
function processBags(client, url) {
  var d = q.defer();
  console.log(("FETCHING: " + url).blue)
  request({url: url, json: true}, function (err, response, body) {
    if (err) {
        console.log(getLogDate() + "get failed: " + err);
        return d.reject(getLogDate() + "get failed: " + err);
    }

    if (!err && response.statusCode == 200) {
        console.log(("SUCCESS: Fetched " + body.data.length + " results").green);
        var data = body.data;

        // get out if nothing to fetch
        if(!body.data.length) {
          console.log("Nothing to Fetch. Quitting.");
          return d.resolve(true);
        }
        console.log("Found restults. continuing.");
        return query("update settings set settingValue = " + body.pagination.min_tag_id + " where settingKey = 'min_tag_id';")
        .then(function(rows) {
          console.log("updated min_tag_id")
          
          var bigSqlStr = "";

          for (var i = 0; i < data.length; i++) {
            var photo = data[i];
            if(photo.location && photo.type == "image") {
                var sql = "insert into photos (id, created, thumbnailUrl, lowResUrl, hiReslUrl, latitude, longitude, locationName, userId, caption) " +
                          " values ('" + photo.id + "', '" + photo.created_time + "', '" + photo.images.thumbnail.url +
                          "', '" + photo.images.low_resolution.url + "', '" + photo.images.standard_resolution.url + "', '" + 
                          photo.location.latitude + "', '" + photo.location.longitude + "', '" + photo.location.name + "', " +
                          photo.user.id + ", '" + mysqlStringScrub(photo.caption.text) + "');"

                //console.log(sql)
                bigSqlStr = bigSqlStr + sql;
            }
          }
          
          if(bigSqlStr !== "") {
            return query(sql).then(function(rows) {
              console.log("success!" + photo.id);
              console.log((getLogDate() + "Processed " + data.length + " bags").green);
            })
          }

          

          // // process user
          //   user: 
          //  { username: 'bagsintrees',
          //    website: '',
          //    profile_picture: 'http://images.ak.instagram.com/profiles/anonymousUser.jpg',
          //    full_name: 'Jim Clouse',
          //    bio: '',
          //    id: '1222882501' } }

      })
      //recurse process bags if there is another
      .then( function() {
        if(body.pagination && body.pagination.next_url) {
          return processBags(client, body.pagination.next_url)
          .then (function() {
            return d.resolve();
          })
        }
        else {
          return d.resolve();      
        }

      });
    }
    else {
      console.log("ERROR: Instagram API Get failed!".red);
      console.log("ERROR: (" + body.meta.code + ") " + body.meta.error_type + "; " + body.meta.error_message);
      return d.reject();
    }
  });

  return d.promise;
}
