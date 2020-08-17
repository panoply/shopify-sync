// ts-nocheck

import _ from 'lodash'
import { parse, basename, sep, dirname } from 'path'
import glob from 'glob'
import anymatch from 'anymatch'
import { log, asyncForEach, waitFor } from '../config/utils'
import chalk from 'chalk'
import { readFile } from 'fs-extra'
import request from '../config/request'
import configuration from '../config/config'
import targets from '../config/target'
import ignore from '../config/ignore'
import clear from 'console-clear'
import logUpdate from 'log-update'
import boxen from 'boxen'

/**
 * Uploading
 *
 * @param {object} options
 * @param {function} callback
 */
export default async function (options, callback) {

  let total = 0

  const config = await configuration()
  const target = await targets(config, options)

  if (!options.file) Object.assign(options, config)

  const directory = options.dir || 'theme'
  const dirMatch = new RegExp(`^${directory}/${_.first(options._)}`)
  const { settings } = ignore(options)
  const filter = _.first(settings._) ? dirMatch : null

  let files = glob.sync(`${directory}/**/*`, { nodir: true })

  // When using the CLI and passing in filter
  if (filter) files = files.filter(file => filter.test(file))

  // When using API and has `ignore`
  // We will exclude all ignores
  if (settings?.ignore?.length > 0) {
    files = files.filter(file => !anymatch(settings.ignore, file))
  }

  const items = files.map(file => {

    const pathParts = file.split(sep)
    const trimmedParts = _.drop(pathParts, (_.lastIndexOf(pathParts, directory) + 1))
    const filepath = trimmedParts.join(sep)

    return {
      key: filepath,
      name: basename(filepath),
      path: file
    }

  })

  const logger = logUpdate.create(process.stdout)
  const problems = []

  clear(true)

  return asyncForEach(items, async file => {

    await waitFor(100)

    const content = await readFile(file.path)

    request(target, {
      method: 'put',
      url: `/admin/themes/${target.theme_id}/assets.json`,
      data: {
        asset: {
          key: file.key,
          attachment: content.toString('base64')
        }
      }
    }).catch(e => {

      problems.push(...[
        problems.length === 0
          ? chalk`{grey.dim ┌──} {redBright Failed} '{red ${e.message}}'`
          : chalk`{grey.dim ├──} {redBright Failed} '{red ${e.message}}'`,
        _.isArray(e.data)
          ? e.data.map((i, k) => {
            if (e.data.length - 1 === k) {
              return chalk`{grey.dim │  └──} {dim ${i}}`
            } else {
              return chalk`{grey.dim │  ├──} {dim ${i}}`
            }
          }).join('\n')
          : !_.isUndefined(e.data) && chalk`{yellow.dim.italic ${e.data}}`
      ])

    })

    logger(
      boxen([
        chalk`{magenta    Store}{dim :} {dim.underline ${target.primary_domain}}     `,
        chalk`{magenta     File}{dim :} {cyan ${basename(file.key)}}`,
        chalk`{magenta Progress}{dim :} {cyan ${total += 1}} of {cyan ${items.length}}`,
        chalk`{magenta   Output}{dim :} {dim ${directory}/}{cyan ${dirname(file.key)}}`,
        chalk`{magenta   Errors}{dim :} {red ${problems.length}}`

      ].join('\n'), {
        padding: 1,
        borderColor: 'gray',
        dimBorder: true,
        // @ts-ignore
        borderStyle: 'round'
      }),
      problems.length > 0 ? `\n${problems.join('\n')}` : ''
    )

    if (typeof callback === 'function') {
      callback.apply({ file: parse(file.path), content })
    }

  }).finally(() => {

    log(chalk`Uploaded: {green ${total}} files.`)
    log(chalk`Problems: {red ${problems.length}}`)

  })

}
