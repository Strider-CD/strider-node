'use strict';

var path = require('path');
var async = require('async');
var packageHash = require('./package-hash');

function updateCache(context, projectDir, done) {
  // We don't support any caching in a docker container, as the container is reconstructed on every run anyway.
  if (context.runnerId === 'docker') {
    return done();
  }

  var cachier = context.cachier('modules');

  packageHash(projectDir, function (err, hash) {
    if (err) {
      return done(err);
    }

    var dest = path.join(projectDir, 'node_modules');

    context.comment('saved node_modules to cache');

    async.series([
      cachier.update.bind(null, hash, dest),
      cachier.update.bind(null, context.branch, dest)
    ], done);
  });
}

module.exports = updateCache;
