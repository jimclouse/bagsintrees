var mysql      = require('mysql');

var connection = mysql.createConnection({
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
  var d = new Date;
  return (d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' + d.toLocaleTimeString({hour: '2-digit', minute:'2-digit', second:'2-digit'}) + '\t');
}

/**
connect to db
**/
function connect() {
  connection.connect(function(err) {
    if (err) {
      console.error(getLogDate() + 'error connecting: ' + err.stack);
      return false;
    }
    console.log(getLogDate() + 'mysql connected as id ' + connection.threadId);
    return true;
  });
}

/** 
	fire off the connection
**/
connect()

/**
  performs a promise query against the database
**/
function query(sql, cb) {
  connection.query(sql, function(err, rows, fields) {
    if (err) {
    	cb(null, err);
    }
    cb(rows);
  });
} 

exports.query = query;