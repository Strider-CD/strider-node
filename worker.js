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

function installPackages(context, cachedir, datadir, policy, update, done) {
  function install() {
    context.cmd('npm install --color=always', done)
  }
  if (policy !== 'strict' && policy !== 'loose') return install()
  fs.readFile(path.join(datadir, 'package.json'), 'utf8', function (err, packagejson) {
    if (err) return done()
    var hash = md5(packagejson)
      , hashdir = path.join(cachedir, 'node/modules', hash)
    fs.exists(hashdir, function (exists) {
      if (exists) {
        context.comment('restored node_modules from cache')
        return cpDir(hashdir, path.join(datadir, 'node_modules'), function (err) {
          if (err) return done(err)
          if (!update) return done(null, true)
          context.cmd('npm update --color=always', done)
        })
      }
      if (policy === 'strict') return install()
      var branchdir = path.join(cachedir, 'node/modules', context.branch)
      fs.exists(branchdir, function (exists) {
        if (!exists) return install()
        context.comment('restoring node_modules from cache')
        cpDir(hashdir, path.join(datadir, 'node_modules'), function () {
          context.cmd('npm prune', function (err) {
            if (err) return done(err)
            context.cmd('npm update', done)
          })
        })
      })
    })
  })
}

function updateCache(context, cachedir, datadir, done) {
  fs.readFile(path.join(datadir, 'package.json'), 'utf8', function (err, packagejson) {
    if (err) return done()
    var hash = md5(packagejson)
      , hashdir = path.join(cachedir, 'node/modules', hash)
      , nmdir = path.join(datadir, 'node_modules')
    context.comment('saved node_modules to cache')
    async.series([
      cpDir.bind(null, nmdir, hashdir),
      cpDir.bind(null, nmdir, path.join(cachedir, 'node/modules', context.branch))
    ], done)
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
      path: [path.join(__dirname, 'node_modules/.bin')],
      prepare: function (context, done) {
        if (fs.existsSync(path.join(context.dataDir, 'package.json'))) {
          context.data({doTest: true}, 'extend')
          return installPackages(context, context.cacheDir, context.dataDir, config.caching, config.update_cache, function (err, exact) {
            if (err) return done(err)
            if (exact) return done(err, true)
            updateCache(context, context.cacheDir, context.dataDir, function (err) {
              done(err, true)
            })
          })
        }
        done(null, false)
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

