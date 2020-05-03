module.exports = {
  // an object that defines the schema for configuration
  config: {
    runtime: {
      type: String,
      enum: ['14', '12', '10', 'lts', 'stable', 'latest', 'whatever', 'custom'],
      default: 'whatever',
    },
    customVersion: {
      type: String,
      default: '10.13.0',
    },
    caching: {
      type: String,
      enum: ['strict', 'loose', 'none'],
      default: 'none',
    },
    test: { type: String, default: 'npm test' },
    globals: [
      {
        type: String,
      },
    ],
  },
};
