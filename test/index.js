'use strict';

var test = require('tape');

test('npm command', function (t) {
  var npmCommand = require('../lib/npm-command');
  var install = npmCommand('install');
  var installGlobal = npmCommand('install', [
    'bower'
  ]);

  t.same(install, {
    command: 'npm',
    args: ['install', '--color=always'],
    screen: 'npm install'
  }, 'basic are correct');

  t.same(installGlobal, {
    command: 'npm',
    args: ['install', '--color=always', 'bower'],
    screen: 'npm install -g bower'
  }, 'globals are correct');
  t.end();
});
