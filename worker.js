var path = require('path')

module.exports = {
  // an object that defines the schema for configuration
  config: null,
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, repo, cb) {
    cb(null, {
      // string or list - to be added to the PATH
      path: path.join(__dirname, '../node_modules/npm/bin'),
      // any extra env variables
      env: {},
      // For each phase that you want to deal with, provide either a shell
      // string or fn(context, done)
      prepare: 'npm install',
      test: 'npm test',
      cleanup: 'rm -rf node_modules'
    });
  },
  // if provided, autodetect is run if the project has *no* plugin
  // configuration at all.
  gumshoe: {
    filename: 'package.json',
    exists: true,
    language: 'node.js',
    framework: null
  }
}

