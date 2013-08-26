var gumshoe = require('gumshoe')
  , path = require('path')

var NODE_RULE = {
  filename: 'package.json',
  exists: true,
  language: 'node.js',
  framework: null,
  prepare: 'npm install',
  test: 'npm test',
  start: 'npm start',
  path: path.join(__dirname, '../node_modules/npm/bin')
}


module.exports = function(ctx, cb){

  var doTest = function(ctx , cb){
    gumshoe.run(ctx.workingDir, [NODE_RULE], cb) 
  }
 
  ctx.addBuildHook({
    test: doTest
  })

  cb(null)
}

