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

  function runCmd(ctx, cmd, cb) {
    gumshoe.run(ctx.workingDir, [NODE_RULE], function(err, res) {
      if (err) return cb(0)
      var psh = ctx.shellWrap(cmd)
      ctx.forkProc(ctx.workingDir, psh.cmd, psh.args, function(code) {
        return cb(code)
      })
    })
  }

  var doTest = function(ctx , cb){
    runCmd(ctx, NODE_RULE.test, cb)
  }

  var doPrepare  = function(ctx, cb) {
    runCmd(ctx, NODE_RULE.prepare, cb)
  }

 
  ctx.addBuildHook({
    test: doTest,
    prepare: doPrepare,
  })

  console.log("strider-node worker extension loaded")

  cb(null)
}

