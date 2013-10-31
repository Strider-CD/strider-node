
module.exports = {
  // an object that defines the schema for configuration
  config: {
    runtime: {
      type: String,
      enum: ['0.6', '0.8', '0.10', '0.11', 'stable', 'latest', 'whatever'],
      default: 'whatever'
    },
    test: { type: String, default: 'npm test' },
    globals: [{
      type: String
    }]
  },
  /** This is where we'd fire off extra builds
  listen: function (io) {
    io.on('job.new', function (job) {
      if (job.trigger.type !== 'commit') return
      newjob = copy(job)
      newjob.trigger = {
        ...
      }
      io.emit('job.new', newjob);
      ...
    })
  }
  **/
}
