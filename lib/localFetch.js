'use strict'
var mysqlClient     = require('./mysqlClient');
var fetchBags 		= require('./mysqlFetchBags');

fetchBags.fetch(function(res){
	console.log(res);
	mysqlClient.end();
});