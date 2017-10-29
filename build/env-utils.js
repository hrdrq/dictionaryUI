var
  config = require('../config'),
  theme = process.argv[2] || config.defaultTheme

module.exports = {
  dev: process.env.NODE_ENV === 'development',
  prod: process.env.NODE_ENV === 'production',
  gc: process.env.NODE_ENV === 'gc',

  platform: {
    theme: theme,
    cordovaAssets: './cordova/platforms/' + (theme === 'mat' ? 'android' : 'ios') + '/platform_www'
  }
}
