'use strict'
var request = require('request');
var colors = require('colors');
var q = require('q')
var CLIENT_ID = process.env['CLIENT_ID'];
var tagUrl = "https://api.instagram.com/v1/tags/bagsintrees/media/recent?client_id=" + CLIENT_ID;

var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'bags',
  password : 'query4Bag$',
  database : 'bagsintrees',
  multipleStatements : true
});

/**
connect to db
**/
function connect() {
  var d = q.defer();
  connection.connect(function(err) {
    if (err) {
      console.error(getLogDate() + 'error connecting: ' + err.stack);
      return d.reject(err);
    }

    console.log(getLogDate() + 'mysql connected as id ' + connection.threadId);
    return d.resolve(true);
  });
  return d.promise;
}
/**
  performs a promise query against the database
**/
function query(sql) {
  var d = q.defer();
  connection.query(sql, function(err, rows, fields) {
    if (err) {d.reject(err);}
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
function fetch() {
  var d = q.defer();
  connect()
  .then( function() {
    console.log((getLogDate() + '*** Loading bags from Instagram').blue);

    query("select settingValue as min_tag_id from settings where settingKey = 'min_tag_id';")
    .then(function(rows) {
      
      var url = tagUrl;
      if(rows[0].min_tag_id) {
        console.log(getLogDate() + "Found min tag id " + rows[0].min_tag_id);
        url = url + '&min_tag_id=' + rows[0].min_tag_id;
      }
      processBags(url).then(function() {
        console.log(getLogDate() + "Closing mysql client");
        connection.end();
        d.resolve(getLogDate() + "Finished. do nothing.");
      }).catch(function(err) {
        console.log(getLogDate() + "Closing mysql client");
        connection.end();
        d.reject(err);
      });
    }).catch( function(err) {console.log("err2"); d.reject(err)});  
  }).catch( function(err) {console.log("err3"); d.reject(err)});
  return d.promise;
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
  actual worker method: downloads data from Instagram and saves to redis 
  if multiple pages, gets them all
**/
function processBags(url) {
  var d = q.defer();

  instagramFetch(url)
  .then( function(body) {
    // get out if nothing to fetch
    if(!body.data.length) {
      console.log(getLogDate() + "Nothing to Fetch. Quitting.");
      d.resolve(true);
    }
    var data = body.data
   
    return query("update settings set settingValue = " + body.pagination.min_tag_id + " where settingKey = 'min_tag_id';")
  .then(function(rows) {
    console.log(getLogDate() + "Updated Min Tag Id to " + body.pagination.min_tag_id)
      
    var bigSqlStr = "";

    for (var i = 0; i < data.length; i++) {
      var photo = data[i];
      if(photo.location && photo.type == "image") {
          var sql = "insert into photos (id, created, thumbnailUrl, lowResUrl, hiReslUrl, latitude, longitude, locationName, userId, caption) " +
                    " values ('" + photo.id + "', '" + photo.created_time + "', '" + photo.images.thumbnail.url +
                    "', '" + photo.images.low_resolution.url + "', '" + photo.images.standard_resolution.url + "', '" + 
                    photo.location.latitude + "', '" + photo.location.longitude + "', " + dbStringFormat(photo.location.name) + ", " +
                    photo.user.id + ", '" + mysqlStringScrub(photo.caption.text) + "');"

          bigSqlStr = (bigSqlStr + sql);
      }
    }
    
    // // process user
    //   user: 
    //  { username: 'bagsintrees',
    //    profile_picture: 'http://images.ak.instagram.com/profiles/anonymousUser.jpg',
    //    full_name: 'Jim Clouse',
    //    id: '1222882501' } }

    if(bigSqlStr !== "") {
    query(bigSqlStr)
      .then(function(rows) {
          console.log((getLogDate() + "Processed " + data.length + " bags").green);

          //recurse process bags if there is another
          if(body.pagination && body.pagination.next_url) {
            return processBags(body.pagination.next_url).then (function() {
              d.resolve();
            })
          }
          else {return d.resolve();}
      }).catch(function(err) {return d.reject(err);})
    }
  }).catch(function(err) {
    d.reject(err);
  });
  });
  
  return d.promise;
}
