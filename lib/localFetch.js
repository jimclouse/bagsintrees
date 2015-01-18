'use strict'
var mysqlClient     = require('./mysqlClient');
var fetchBags 		= require('./mysqlFetchBags');
var log 			= require('./log');

fetchBags.fetch('bagsintrees', function(res){
	log.info(res);
	mysqlClient.end();
});