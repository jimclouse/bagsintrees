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
  log.info("Arived in data Handler)");
  sql = "update settings set settingValue = " + body.pagination.min_tag_id + " where settingKey = 'min_tag_id_" + tag + "' and (" + body.pagination.min_tag_id + " > settingValue or settingValue is null);";
  return mysqlPromise(sql)
    .then(function (res) {
      log.info("Updated Min Tag Id to " + body.pagination.min_tag_id);
      return true
    })
    .then(function (res) {
      return mysqlPromise("select now();");
    })
    .then(function (res) {
      console.log(res);
      return;
    });    
}


/** 
  Promise Loop Worker
**/
var promiseWhile = function(tag, condition, action) {
  var url = TAG_SEARCH_URL.replace('$tag$', tag);

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
promiseWhile('bagsintrees', instagramFetch, dataHandler)
.then(function() {
  log.debug('Complete. Success.');
  process.exit(0);
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
  process.exit(1);
});




