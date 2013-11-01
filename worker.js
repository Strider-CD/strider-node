var path = require('path')
  , fs = require('fs')
  , spawn = require('child_process').spawn

  , async = require('async')
  , md5 = require('MD5')
  , mkdirp = require('mkdirp')

function cpDir(from, to, done) {
  spawn('rm', ['-rf', to]).on('close', function () {
    mkdirp(path.dirname(to), function () {
      var out = ''
        , child = spawn('cp', ['-R', from, to])
      child.stdout.on('data', function (data) {
        out += data.toString()
      })
      child.stderr.on('data', function (data) {
        out += data.toString()
      })
      child.on('close', function (exitCode) {
        return done(exitCode && new Error('Failed to copy directory: ' + out + ' ' + exitCode))
      })
    })
  })
}

function packageHash(dir, done) {
  fs.readFile(path.join(dir, 'package.json'), 'utf8', function (err, packagejson) {
    if (err) return done(err)
    var hash = md5(packagejson)
    done(null, hash)
  })
}

function installPackages(context, cachier, datadir, policy, update, done) {
  function install() {
    context.cmd('npm install --color=always', done)
  }
  if (policy !== 'strict' && policy !== 'loose') return install()
  // hash the package.json
  packageHash(datadir, function (err, hash) {
    if (err) return done()
    var dest = path.join(datadir, 'node_modules')
    // try for an exact match
    cachier.get(hash, dest, function (err) {
      if (!err) {
        context.comment('restored node_modules from cache')
        if (!update) return done(null, true)
        return context.cmd('npm update --color=always', done)
      }
      if (policy === 'strict') return install()
      // otherwise restore from the latest branch, prune and update
      cachier.get(context.branch, dest, function (err) {
        if (err) return install()
        context.comment('restored node_modules from cache')
        context.cmd('npm prune', function (err) {
          if (err) return done(err)
          context.cmd('npm update', done)
        })
      })
    })
  })
}

function updateCache(context, cachier, datadir, done) {
  packageHash(datadir, function (err, hash) {
    if (err) return done()
    var dest = path.join(datadir, 'node_modules')
    context.comment('saved node_modules to cache')
    async.series([
      cachier.update.bind(null, hash, dest),
      cachier.update.bind(null, context.branch, dest),
    ], done)
  })
}

function updateGlobalCache(globals, context, cachier, datadir, done) {
  var dest = path.join(datadir, 'node_modules')
  context.comment('saved global modules to cache')
  cachier.update(md5(globals.join(' ')), dest, done)
}

function installGlobals(globals, context, cachier, globalDir, policy, done) {
  function install() {
    mkdirp(path.join(globalDir, 'node_modules'), function () {
      context.cmd({
        cmd: {command: 'npm', args: ['install', '--color=always'].concat(globals)},
        cwd: globalDir
      }, function (err) {
        return done(err)
      })
    })
  }
  if (policy !== 'strict' && policy !== 'loose') return install()
  var dest = path.join(globalDir, 'node_modules')
  cachier.get(md5(globals.join(' ')), dest, function (err) {
    if (err) return install()
    context.comment('restored global modules from cache')
    return done(null, true)
  })
}

module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, context, cb) {
    config = config || {}
    var ret = {
      env: {
        MOCHA_COLORS: 1
      },
      path: [path.join(__dirname, 'node_modules/.bin'), path.join(context.dataDir, '.globals/node_modules/.bin')],
      prepare: function (context, done) {
        var npmInstall = fs.existsSync(path.join(context.dataDir, 'package.json'))
          , global = config.globals && config.globals.length
        if (config.test && config.test !== '<none>') context.data({doTest: true}, 'extend')
        if (!npmInstall && !global) return done(null, false)
        var tasks = []
        var nocache = config.caching !== 'strict' && config.caching !== 'loose'
        if (npmInstall) {
          tasks.push(function (next) {
            installPackages(context, context.cachier('modules'), context.dataDir, config.caching, config.update_cache, function (err, exact) {
              if (err || exact || nocache) return next(err)
              updateCache(context, context.cachier('modules'), context.dataDir, next)
            })
          })
        }
        if (global) {
          tasks.push(function (next) {
            var globalDir = path.join(context.dataDir, '.globals')
            installGlobals(config.globals, context, context.cachier('globals'), globalDir, config.caching, function (err, cached) {
              if (err || nocache || cached) return next(err)
              updateGlobalCache(config.globals, context, context.cachier('globals'), globalDir, next)
            })
          })
        }
        async.series(tasks, done)
      },
      // cleanup: 'rm -rf node_modules'
    }
    if (config.test && config.test !== '<none>') {
      ret.test = typeof(config.test) !== 'string' ? 'npm test' : config.test
    }
    if (config.runtime && config.runtime !== 'whatever') {
      ret.env.N_PREFIX = path.join(context.baseDir, '.n')
      // string or list - to be prefixed to the PATH
      ret.path = ret.path.concat([path.join(__dirname, 'node_modules/n/bin'), ret.env.N_PREFIX + '/bin'])
      ret.environment = {
        cmd: 'n ' + config.runtime,
        silent: true
      }
    }
    cb(null, ret)
  },
  // if provided, autodetect is run if the project has *no* plugin
  // configuration at all.
  autodetect: {
    filename: 'package.json',
    exists: true,
    language: 'node.js',
    framework: null
  }
}

