var mysql   = require('mysql');
var q       = require('q');

var connectionPool  = mysql.createPool({
  connectionLimit : 250,
  host     : 'localhost',
  user     : 'bags',
  password : 'query4Bag$',
  database : 'bagsintrees',
  multipleStatements : true
});

/**
  helper method for log formatting 
**/
function getLogDate() {
  var d = new Date();
  return (d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + d.toLocaleTimeString({hour: '2-digit', minute:'2-digit', second:'2-digit'}) + '\t');
}

/**
connect to db
**/
// function connect() {
//   connection.connect(function(err) {
//     if (err) {
//       console.error(getLogDate() + 'error connecting: ' + err.stack);
//       return false;
//     }
//     console.log(getLogDate() + 'mysql connected as id ' + connection.threadId);
//     return true;
//   });
// }

// /** 
//  fire off the connection
// **/
// connect()


connectionPool.on('connection', function (connection) {
  console.log(getLogDate() + 'New pool connection established');
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
      cb(null, err);
    }
    cb(results);
  });
}

function end() {
  console.error(getLogDate() + 'Closing Mysql client');
	connectionPool.end();
}


exports.query = query;
exports.promiseQuery = promiseQuery;
exports.end = end;