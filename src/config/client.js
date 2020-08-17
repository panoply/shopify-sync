import _ from 'lodash'
import chalk from 'chalk'
import upload from '../sync/upload'
import watch from '../sync/watch'
import download from '../sync/download'
import { log } from './utils'

const HELPTEXT = chalk`
  {green.bold Shopify Sync} – {bold Commands}
  {gray ---------------------------------------------------------}

  {bold Commands:}
    sync watch [options] – {gray.italic Watch theme folder}
    sync upload [options] [filter] – {gray.italic Upload theme files}
    sync download [options] [filter] – {gray.italic Download theme files}
`

/**
 * Client
 *
 * @export
 * @param {object} options
 * @param {function} [callback]
 * @returns
 */
export default async function (options, callback) {

  let command
  let result

  if (!options._) {
    command = options.resource
    options.file = true
  } else {
    command = _.first(options._)
    options._ = options._.slice(1)
    options.file = false
  }

  try {

    if (command === 'watch') {
      result = await watch(options, callback)
    } else if (command === 'upload') {
      result = await upload(options, callback)
    } else if (command === 'download') {
      result = await download(options, callback)
    } else {
      process.stdout.write(HELPTEXT)
    }

    if (typeof result !== 'undefined') {
      process.stdout.write(result)
    }

  } catch (e) {

    let error = null

    if (e.stack) {
      error = e.stack
    }

    log(_.isNull(error) ? e : error, 'red')
  }

  return result

}
