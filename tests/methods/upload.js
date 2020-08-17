const sync = require('../../package/index.js')

sync('upload', {
  dir: 'example',
  concurrency: 5,
  target: 'development',
  ignore: [
    'example/dist/**/**',
    'example/sections/ignore.js',
    'example/assets/ignore.liquid'
  ]
}, function () {

  // console.log(this)

})
