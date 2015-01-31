var mysql   = require('mysql');
var q       = require('q');
var log     = require('./log');

var connectionPool  = mysql.createPool({
  connectionLimit : process.env.msyqlConnectionPoolLimit,
  host     : process.env.mysqlHost,
  user     : process.env.mysqlUser,
  password : process.env.mysqlPassword,
  database : process.env.mysqlDatabase,
  multipleStatements : true
});

connectionPool.on('connection', function (connection) {
  log.info('New pool connection established');
});

/**
  performs a promise query against the database
**/
function promiseQuery(sql) {
  var d = q.defer();
  connectionPool.query(sql, function (err, results, fields) {
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
  connectionPool.query(sql, function (err, results, fields) {
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