'use strict';

var path = require('path');
var fs = require('fs-extra');
var md5 = require('MD5');
var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function installGlobals(config, context, globalDir, done) {
  var globals = config.globals;
  var cachier = context.cachier('globals');
  var policy = config.caching;

  if (policy !== 'strict' && policy !== 'loose') {
    return install(globals, globalDir, context, done);
  }

  var dest = path.join(globalDir, 'node_modules');

  cachier.get(md5(globals.join(' ')), dest, function (err) {
    if (err) {
      return install(globals, globalDir, context, done);
    }

    context.comment('restored global modules from cache');

    return done(null, true);
  });
}

function install(globals, dir, context, cb) {
  fs.mkdirp(path.join(dir, 'node_modules'), function () {
    context.cmd({
      cmd: {
        command: npm,
        args: ['install', '--color=always'].concat(globals),
        screen: 'npm install -g'
      },
      cwd: dir
    }, function (err) {
      return cb(err)
    });
  });
}
