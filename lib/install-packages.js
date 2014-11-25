'use strict';

var path = require('path');
var packageHash = require('./package-hash');
var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function installPackages(config, context, done) {
  var update = config.update_cache;
  var cachier = context.cachier('globals');
  var dataDir = context.dataDir;
  var policy = config.caching;

  if (policy !== 'strict' && policy !== 'loose') {
    return npmCommand('install', context, done);
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

        return npmCommand('update', context, done); 
      }

      if (policy === 'strict') {
        return npmCommand('install', context, done);
      }

      // otherwise restore from the latest branch, prune and update
      cachier.get(context.branch, dest, function (err) {
        if (err) {
          return npmCommand('install', context, done);
        }

        context.comment('restored node_modules from cache');

        npmCommand('prune', context, function (err) {
          if (err) {
            return done(err);
          }

          npmCommand('update', context, done); 
        });
      });
    });
  });
}

module.exports = installPackages;

function npmCommand(command, context, cb) {
  context.cmd({
    command: npm,
    args: [command, '--color=always'],
    screen: 'npm ' + command
  }, cb);
}
