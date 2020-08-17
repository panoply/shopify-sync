import _ from 'lodash'
import path from 'path'
import { readFile } from 'fs-extra'
import chokidar from 'chokidar'
import chalk from 'chalk'
import anymatch from 'anymatch'
import { log } from '../config/utils'
import boxen from 'boxen'
import request from '../config/request'
import configuration from '../config/config'
import targets from '../config/target'
import ignore from '../config/ignore'

/**
 * Watcher
 *
 * @param {object} options
 * @param {function} callback
 */
export default async function (options, callback) {

  const config = await configuration()
  const target = await targets(config, options)

  if (!options.file) Object.assign(options, config)

  const directory = options.dir || 'theme'
  const dirMatch = new RegExp(`^${directory}`)
  const { settings, ignored } = ignore(options)
  const watcher = chokidar.watch(`./${directory}/`, {
    ignored: _.isNull(ignored.files) ? ignored.base : ignored.files,
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 100,
    binaryInterval: 100,
    cwd: process.cwd()
  })

  watcher.on('all', async (event, file) => {

    try {

      const parts = file.split(path.sep)
      const trimmed = _.drop(parts, (_.lastIndexOf(parts, directory) + 1))
      const key = trimmed.join(path.sep)

      if (file.match(/^\..*$/) || !file.match(dirMatch)) {
        return log(chalk`{red Issue in match "/^\..*$/" at: ${file}}"`)
      }

      if (file.match(/[()]/)) {
        return log(chalk`{red Filename cannot contain parentheses at: "${file}"`)
      }

      if (_.has(settings, 'ignore') && settings.ignore.length > 0) {
        if (anymatch(settings.ignore, file)) {
          return log(chalk`{gray Ignoring} '{gray ${file}}'`)
        }
      }

      if (event === 'change' || event === 'add') {

        const data = await readFile(file)
        const attachment = data.toString('base64')

        await request(target, {
          method: 'put',
          url: `/admin/themes/${target.theme_id}/assets.json`,
          data: {
            asset: {
              key: key.split(path.sep).join('/'),
              attachment
            }
          }
        }).then(i => {

          log(chalk`{green Uploaded} '{green ${file}}'`)

          if (typeof callback === 'function') {
            callback.apply({
              file: path.parse(file),
              content: data
            })
          }

        })

      } else if (event === 'unlink') {

        await request(target, {
          method: 'delete',
          url: `/admin/themes/${target.theme_id}/assets.json?asset[key]=${key.split(path.sep).join('/')}`
        })

        log(chalk`{green Deleted} '{green ${file}}'`)

      }

    } catch (e) {

      const regex = /(?:[{'%]{2}|\/).*?(?:[%'}]{2}|\/)|\(line\s[0-9]+\)/g

      let output

      if (e.stack) output = e.stack
      else {
        const plural = e.data.length > 1 ? 'Errors' : 'Error'
        output = chalk`{red.bold ${e.data.length}} {red ${plural}} {dim in} {red ${e.message}}`
        output += '\n\n'
        output += e.data.map((i, k) => chalk.bold(k + 1) + ' ' + i.replace(regex, match => {
          if (match[0] === '(') return chalk.cyan.dim(match)
          else if (match[0] === '/') return chalk.magenta(match)
          else return chalk.yellow(match) + '.'
        })).join('\n')
        output += '\n'
      }

      log(output)

    }
  })

  let banner =
    chalk`  Target: {green ${target.target_name}}\n` +
    chalk`   Store: {green https://${target.domain}.myshopify.com}\n` +
    chalk`Watching: {green ${directory}/**/**}`

  if (!_.isNull(ignored.log)) {
    banner += chalk`\nIgnoring: {yellow ${ignored.count}} Files\n`
    banner += chalk`\t {whiteBright -} {yellow ${ignored.log}}`
  }

  log(
    chalk.whiteBright.bold('Shopify Sync\n') + boxen(banner, {
      padding: 0,
      borderColor: 'gray',
      dimBorder: true,
      borderStyle: {
        topLeft: ' ',
        topRight: ' ',
        bottomLeft: ' ',
        bottomRight: ' ',
        horizontal: '-',
        vertical: ' '
      }
    })
  )

}
