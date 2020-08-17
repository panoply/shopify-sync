const _ = require('lodash')
const chalk = require('chalk')
const log = require('fancy-log')

export default function (
  content,
  color = 'white',
  message = ''
) {

  if (_.isObject(content)) {

    if (content.message) {
      message += content.message + '\n\n\t'
    }

    if (content.data) {

      const { data } = content

      if (data.asset) {
        message += JSON.stringify(_.omit(data.asset, 'attachment'))
      } else {
        message += JSON.stringify(data)
      }

    }

  } else {

    message = content

  }

  log(chalk[color](message))

}
