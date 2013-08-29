var detect = require('strider-detection-rules')
var gumshoe = require('gumshoe')
var path = require('path')

var NODE_RULES = [{
  filename: 'package.json',
  exists: true,
  language: 'node.js',
  framework: null,
  prepare: 'npm install',
  test: 'npm test',
  start: 'npm start',
  path: path.join(__dirname, '../node_modules/npm/bin')
}]


module.exports = function(ctx, cb){

  var doTest = function(ctx , cb){
    detect(NODE_RULES, "test", ctx, cb)
  }

  var doPrepare  = function(ctx, cb) {
    detect(NODE_RULES, "prepare", ctx, cb)
  }

 
  ctx.addBuildHook({
    test: doTest,
    prepare: doPrepare,
  })

  console.log("strider-node worker extension loaded")

  cb(null)
}

