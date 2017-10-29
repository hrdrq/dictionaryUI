process.env.NODE_ENV = 'gc'

require('colors')

var
  shell = require('shelljs'),
  path = require('path'),
  env = require('./env-utils'),
  css = require('./css-utils_gc'),
  config = require('../config'),
  webpack = require('webpack'),
  webpackConfig = require('./webpack.gc.conf'),
  targetPath = path.join(__dirname, '../gc')

console.log(' WARNING!'.bold)
console.log(' Do NOT use VueRouter\'s "history" mode if')
console.log(' building for Cordova or Electron.\n')

require('./script.gc_clean.js')
console.log((' Building[GC] Quasar App with "' + env.platform.theme + '" theme...\n').bold)

shell.mkdir('-p', targetPath)
shell.cp('-R', 'src/statics', targetPath)

function finalize () {
  console.log((
    '\n Build complete with "' + env.platform.theme.bold + '" theme in ' +
    '"/gc"'.bold + ' folder.\n').cyan)

  console.log(' Built files are meant to be served over an HTTP server.'.bold)
  console.log(' Opening index.html over file:// won\'t work.'.bold)
}

webpack(webpackConfig, function (err, stats) {
  if (err) throw err

  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')

  if (stats.hasErrors()) {
    process.exit(1)
  }

  if (config.gc.purifyCSS) {
    css.purify(finalize)
  }
  else {
    finalize()
  }
})
