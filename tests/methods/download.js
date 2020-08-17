const sync = require('../../package/index.js')

sync('download', {
  dir: 'example/dist',
  target: 'development',
  ignore: [
    'snippets/*.liquid'
  ]
}, function () {

  // console.log(this)

})
