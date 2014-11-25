'use strict';

var path = require('path');
var fs = require('fs-extra');
var md5 = require('MD5');

function packageHash(dir, done) {
  fs.readFile(path.join(dir, 'package.json'), 'utf8', function (err, packagejson) {
    if (err) {
      return done(err);
    }

    var hash = md5(packagejson);

    done(null, hash);
  });
}

module.exports = packageHash;
