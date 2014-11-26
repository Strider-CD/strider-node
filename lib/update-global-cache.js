'use strict';

var path = require('path');
var md5 = require('MD5');

function updateGlobalCache(globals, context, dataDir, done) {
  var dest = path.join(dataDir, 'node_modules');
  var cachier = context.cachier('globals');

  context.comment('saved global modules to cache');
  cachier.update(md5(globals.join(' ')), dest, done);
}

module.exports = updateGlobalCache;
