var path = require('path')

module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, context, cb) {
   var ret = {
      // any extra env variables
      env: {},
      // For each phase that you want to deal with, provide either a shell
      // string or fn(context, done)
      prepare: 'npm install',
      cleanup: 'rm -rf node_modules'
    }
    if (config.test) {
      ret.test = 'npm test'
    }
    if (config.runtime !== 'whatever') {
      ret.env.N_PREFIX = path.join(context.dataDir, '.n')
      // string or list - to be prefixed to the PATH
      ret.path = [path.join(__dirname, 'node_modules/n/bin'), ret.env.N_PREFIX + '/bin']
      ret.environment = 'n ' + config.runtime
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

