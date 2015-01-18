var mysql   = require('mysql');
var q       = require('q');
var log     = require('./log');

var connectionPool  = mysql.createPool({
  connectionLimit : 250,
  host     : 'localhost',
  user     : 'bags',
  password : 'query4Bag$',
  database : 'bagsintrees',
  multipleStatements : true
});


/**
connect to db
**/
// function connect() {
//   connection.connect(function(err) {
//     if (err) {
//       log.error('error connecting: ' + err.stack);
//       return false;
//     }
//     log.info('mysql connected as id ' + connection.threadId);
//     return true;
//   });
// }

// /** 
//  fire off the connection
// **/
// connect()


connectionPool.on('connection', function (connection) {
  log.info('New pool connection established');
});

/**
  performs a promise query against the database
**/
function promiseQuery(sql) {
  d = q.defer();
  connectionPool.query(sql, function(err, results, fields) {
    if (err) {
      d.reject(err);
    }
    d.resolve(results);
  });
  return d.promise;
}

/** 
  performs a callback query against the database
**/
function query(sql, cb) {
  connectionPool.query(sql, function(err, results, fields) {
    if (err) {
      cb(null, String(err));
    }
    cb(results);
  });
}

function end() {
  log.info('Closing Mysql client');
	connectionPool.end();
}

exports.query = query;
exports.promiseQuery = promiseQuery;
exports.end = end;