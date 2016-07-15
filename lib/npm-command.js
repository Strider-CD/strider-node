'use strict';

module.exports = function (command, globals) {
  var hasGlobals = globals && globals.length;
  var args = [command, '--color=always'];

  if (hasGlobals) {
    args = args.concat(globals);
  }

  return {
    command: 'npm',
    args: args,
    screen: 'npm ' + command + (hasGlobals ? ' -g ' + globals.join(' ') : '')
  };
};
