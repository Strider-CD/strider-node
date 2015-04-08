'use strict';

var path = require('path');
var async = require('async');
var packageHash = require('./package-hash');

function updateCache(context, done) {
  var cachier = context.cachier('modules');
  var dataDir = context.dataDir;

  packageHash(dataDir, function (err, hash) {
    if (err) {
      return done(err);
    }

    var dest = path.join(dataDir, 'node_modules');

    context.comment('saved node_modules to cache');

    async.series([
      cachier.update.bind(null, hash, dest),
      cachier.update.bind(null, context.branch, dest),
    ], done);
  });
}

module.exports = updateCache;
