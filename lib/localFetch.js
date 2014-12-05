'use strict'
var fetchBags = require('./mysqlFetchBags');

fetchBags.fetch()
	.then( function(res) {console.log("done");})
	.catch( function(err) {console.log("Error " + err);})