'use strict';
var mysqlClient     = require('./mysqlClient');
var fetchBags       = require('./mysqlFetchBags');
var log             = require('./log');

fetchBags.fetch('bagsintrees', function (res) {
  log.info(res);
  // chain the 2 tags this way to prevent closing of the mysqlclient prematurely
  fetchBags.fetch('bagremoved', function (res) {
    log.info(res);
    mysqlClient.end();
  });
});
