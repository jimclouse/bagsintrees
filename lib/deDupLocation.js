'use strict'
var mysqlClient     = require('./mysqlClient');
var fs 				= require('fs');
var path			= require('path');

var root 			= process.cwd();
var sql 			= String(fs.readFileSync( path.join(root, 'sql/deDupLocation.sql') ));

mysqlClient.query(sql, function(res, err) {
    if (err) {
        console.log("ERROR: " + JSON.stringify(err));
    }
    else {
    	console.log("Location de-dup OK");
    	console.log(res);
    }
    mysqlClient.end();
});