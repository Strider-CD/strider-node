'use strict';

var path = require('path');
var fs = require('fs-extra');

function copyDir(from, to, done) {
  fs.remove(to, function () {
    fs.mkdirp(path.dirname(to), function () {
      fs.copy(from, to, function (err) {
        return done(err && new Error('Failed to copy directory: ' + err))
      });
    });
  });
}

module.exports = copyDir;
