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


// var count = 0
// var promiseWhile = Promise.method(function(condition, action, value) {
//     if (!condition(value)) return value;
//     return action(value).then(promiseFor.bind(null, condition, action));
// });

// promiseWhile(
//   function(count) {
//     return count < 10;
//   }, 
//   function(count) {
//       sql = "insert into test (id, val) values (" + count + ", 'somedata')";
//       return mysqlPromise(sql)
//             .then(function (rows) {
//                 console.log("added value " + count.toString());
//                 return ++count;
//               })
//   },
//   0)
// .then(  function() {
//   console.log("Wrapped UP");
//   process.exit(code=0);
// }
//     //console.log.bind(console, 'all done');

// )
// .error( function (err) {
//   console.log('error');
//   console.log(err);
//   process.exit(1);
// });

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
  Promise Loop Worker
**/
var promiseWhile = function(condition, action) {
    var resolver = Promise.defer();

    //var url = TAG_SEARCH_URL.replace('$tag$', tag);
    var url = TAG_SEARCH_URL.replace('$tag$', 'bagsintrees');

    var loop = function() {
        condition(url)
        .then(function(body){
          console.log("Got data back");
          
          if (!body || !body.data) return resolver.resolve(); // get out if no more results

          // Add in url manipulation here
          if (body.pagination && body.pagination.next_url) {
            url = body.pagination.next_url;
          }
          else {
            url = null; // signal to condition method not to hit instagram
          }

          return Promise.cast(action(body.data))
            .then(loop)
            .catch(resolver.reject);
        })
        .catch(function(err, body) {
          log.error("ERROR: Instagram API Get failed!".red);
          console.log("ERROR: (" + err.message + ") " + err.error.meta.error_type + "; " + err.error.meta.error_message);
          return null;
        }); 
        
    };

    process.nextTick(loop);

    return resolver.promise;
};


/** 
  Main method
**/
promiseWhile(
  instagramFetch, 
  function(foo) {
    var resolver = Promise.defer();
    sql = "insert into bagsintrees.test (id, val) values (1, 'somedata')";
    console.log(sql);
    mysqlPromise(sql)
      .then(function (rows) {
          console.log("added value yeah!");
          resolver.resolve();
      });
    return resolver.promise;
  }
)
  .then(function() {
    console.log('all done');
    process.exit(0);
  })
  .error( function (err) {
    console.log('error');
    console.log(err);
    process.exit(1);
  });




