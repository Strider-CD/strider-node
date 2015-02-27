'use strict';

var path = require('path');
var packageHash = require('./package-hash');
var npmCommand = require('./npm-command');

function installPackages(config, context, done) {
  var update = config.update_cache;
  var cachier = context.cachier('modules');
  var dataDir = context.dataDir;
  var policy = config.caching;
  var projectDir = path.join(dataDir, config.subdir || '');

  if (policy !== 'strict' && policy !== 'loose') {
    return runNpm('install', context, projectDir, done);
  }

  // hash the package.json
  packageHash(projectDir, function (err, hash) {
    if (err) {
      return done();
    }

    var dest = path.join(projectDir, 'node_modules');

    // try for an exact match
    cachier.get(hash, dest, function (err) {
      if (!err) {
        context.comment('restored node_modules from cache');

        if (!update) {
          return done(null, true);
        }

        return runNpm('update', context, projectDir, done);
      }

      if (policy === 'strict') {
        return runNpm('install', context, projectDir, done);
      }

      // otherwise restore from the latest branch, prune and update
      cachier.get(context.branch, dest, function (err) {
        if (err) {
          return runNpm('install', context, projectDir, done);
        }

        context.comment('restored node_modules from cache');

        runNpm('prune', context, projectDir, function (err) {
          if (err) {
            return done(err);
          }

          runNpm('update', context, projectDir, done);
        });
      });
    });
  });
}

module.exports = installPackages;

function runNpm(command, context, subdir, cb) {
  context.cmd({
    cmd: npmCommand(command),
    cwd: subdir
  }, cb);
}
