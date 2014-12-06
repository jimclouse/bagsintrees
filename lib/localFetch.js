'use strict'
var fetchBags = require('./mysqlFetchBags');

fetchBags.fetch()
	.then( function(res) {console.log("Fetch Complete. Quitting.");})
	.catch( function(err) {console.log(err);})