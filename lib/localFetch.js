'use strict'
var fetchBags = require('./mysqlFetchBags');

fetchBags.fetch(function(){
	console.log("Fetch Complete. Quitting");
});

	// .then( function(res) {console.log("Fetch Complete. Quitting.");})
	// .catch( function(err) {console.log(err);})