'use strict'
var mysqlClient     = require('./mysqlClient');
var fs 				= require('fs');
var path			= require('path');
var log 			= require('./log');

var root 			= process.cwd();
var sql 			= String(fs.readFileSync( path.join(root, 'sql/deDupLocation.sql') ));

mysqlClient.query(sql, function(res, err) {
    if (err) {
        log.error("ERROR: " + JSON.stringify(err));
    }
    else {
    	log.info("Location de-dup OK");
    	log.info(res);
    }
    mysqlClient.end();
});