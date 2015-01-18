var __slice     = [].slice;
var util        = require('util');
var _           = require('underscore');

var formatMessage = function(args) {
  return _(args).map(function(a) {
    if (!_.isString(a)) {
      a = JSON.stringify(a);
    }
    return a;
  });
};

var log = {
  error: function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return util.log("[ERROR] " + (formatMessage(args)));
  },
  info: function() {
  
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return util.log("[INFO] " + (formatMessage(args)));
  },
  debug: function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (process.env.DEBUG) {
      return util.log("[DEBUG] " + (formatMessage(args)));
    }
  }
};

module.exports = log;
