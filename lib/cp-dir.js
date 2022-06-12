'use strict';

var path = require('path');
var fs = require('fs-extra');

function copyDir(from, to, done) {
  fs.remove(to, function () {
    fs.mkdirp(path.dirname(to), function () {
      /* TODO: JSFIX could not patch the breaking change:
      Allow copying broken symlinks 
      Suggested fix: You can use the exists and existsSync functions https://nodejs.org/api/fs.html#fsexistspath-callback from the fs module to check if a symlink is broken. */
      fs.copy(from, to, function (err) {
        return done(err && new Error('Failed to copy directory: ' + err));
      });
    });
  });
}

module.exports = copyDir;
