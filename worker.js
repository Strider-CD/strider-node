var path = require('path')
  , fs = require('fs')

module.exports = {
  // Initialize the plugin for a job
  //   userConfig: taken from the user.jobplugins[pluginid] object
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (userConfig, config, job, context, cb) {
    config = config || {}
    var ret = {
      env: {
        MOCHA_COLORS: 1
      },
      path: [path.join(__dirname, 'node_modules/.bin')],
      prepare: function (context, done) {
        if (fs.existsSync(path.join(context.dataDir, 'package.json'))) {
          return context.cmd('npm install --color=always --force', function (err) {
            done(err, true)
          })
        }
        done(null, false)
      },
      cleanup: 'rm -rf node_modules'
    }
    if (config.test && config.test !== '<none>') {
      ret.test = 'npm test'
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

