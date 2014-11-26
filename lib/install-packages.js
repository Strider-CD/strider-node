'use strict';

var path = require('path');
var packageHash = require('./package-hash');
var npmCommand = require('./npm-command');

function installPackages(config, context, done) {
  var update = config.update_cache;
  var cachier = context.cachier('globals');
  var dataDir = context.dataDir;
  var policy = config.caching;

  if (policy !== 'strict' && policy !== 'loose') {
    return runNpm('install', context, done);
  }

  // hash the package.json
  packageHash(dataDir, function (err, hash) {
    if (err) {
      return done();
    }

    var dest = path.join(dataDir, 'node_modules');

    // try for an exact match
    cachier.get(hash, dest, function (err) {
      if (!err) {
        context.comment('restored node_modules from cache');

        if (!update) {
          return done(null, true);
        }

        return runNpm('update', context, done);
      }

      if (policy === 'strict') {
        return runNpm('install', context, done);
      }

      // otherwise restore from the latest branch, prune and update
      cachier.get(context.branch, dest, function (err) {
        if (err) {
          return runNpm('install', context, done);
        }

        context.comment('restored node_modules from cache');

        runNpm('prune', context, function (err) {
          if (err) {
            return done(err);
          }

          runNpm('update', context, done);
        });
      });
    });
  });
}

module.exports = installPackages;

function runNpm(command, context, cb) {
  context.cmd(npmCommand(command), cb);
}
