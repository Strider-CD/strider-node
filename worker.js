'use strict';

var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var installPackages = require('./lib/install-packages');
var updateCache = require('./lib/update-cache');
var updateGlobalCache = require('./lib/update-global-cache');
var installGlobals = require('./lib/install-globals');
var npmCommand = require('./lib/npm-command');

module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, context, cb) {
    config = config || {};

    var subDir = config.subdir || '';
    var projectDir = path.join(context.dataDir, subDir);

    var ret = {
      env: {
        MOCHA_COLORS: 1
      },

      path: [
        path.join(__dirname, 'node_modules/.bin'),
        path.join(context.dataDir, '.globals/node_modules/.bin')
      ],

      prepare: function (context, done) {
        var npmInstall = fs.existsSync(path.join(context.dataDir, subDir, 'package.json'));
        var global = config.globals && config.globals.length;

        if (config.test && config.test !== '<none>') {
          context.data({ doTest: true }, 'extend');
        }

        if (!npmInstall && !global) {
          return done(null, false);
        }

        var tasks = [];
        var nocache = config.caching !== 'strict' && config.caching !== 'loose';

        if (npmInstall) {
          tasks.push(function (next) {
            installPackages(config, context, function (err, exact) {
              if (err || exact === true || nocache) {
                return next(err);
              }

              updateCache(context, next);
            });
          });
        }

        if (global) {
          tasks.push(function (next) {
            var globalDir = path.join(context.dataDir, '.globals');

            installGlobals(config, context, globalDir, function (err, cached) {
              if (err || nocache || cached) {
                return next(err);
              }

              updateGlobalCache(config.globals, context, globalDir, next);
            });
          });
        }

        async.series(tasks, done);
      }
    };

    if (config.test && config.test !== '<none>') {
      ret.test = typeof(config.test) !== 'string' ? 'npm test' : config.test;

      ret.test = {
        cmd: ret.test === 'npm test' ? npmCommand('test') : ret.test,
        cwd: projectDir
      };
    }

    if (config.runtime && config.runtime !== 'whatever') {
      ret.env.N_PREFIX = path.join(context.baseDir, '.n');
      // string or list - to be prefixed to the PATH
      ret.path = ret.path.concat([
        path.join(__dirname, 'node_modules/n/bin'),
        ret.env.N_PREFIX + '/bin'
      ]);

      ret.environment = {
        cmd: 'n ' + (config.fork === 'io.js' ? 'io ' : '') + config.runtime,
        silent: true
      };
      
      ret.cleanup = {
        cmd: 'n prev',
        silent: true
      };
    }

    cb(null, ret);
  },
  // if provided, autodetect is run if the project has *no* plugin
  // configuration at all.
  autodetect: {
    filename: 'package.json',
    exists: true,
    language: 'node.js',
    framework: null
  }
};
