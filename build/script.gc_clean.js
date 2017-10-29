var
  shell = require('shelljs'),
  path = require('path')

shell.rm('-rf', path.resolve(__dirname, '../gc/*'))
shell.rm('-rf', path.resolve(__dirname, '../gc/.*'))
console.log(' Cleaned build artifacts.\n')
