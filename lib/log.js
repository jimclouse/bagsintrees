var __slice     = [].slice;
var util        = require('util');
var _           = require('underscore');
var uuid        = require('node-uuid');

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
    var args, err, id, _ref, _ref1;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    id = uuid.v4();
    err = {
      msg: "[ERROR] " + id + " \n " + (formatMessage(args)),
      uuid: id
    };
    util.log(err.msg);
    if ((_ref = args[0]) != null ? _ref.stack : void 0) {
      console.error((_ref1 = args[0]) != null ? _ref1.stack : void 0);
    }
    return err;
  },
  info: function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return util.log("[INFO] " + (formatMessage(args)));
  },
 
  debug: function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (process.env.DEBUG) {
      return util.log("[DEBUG] " + (formatMessage(args)));
    }
  }
};

module.exports = log;
