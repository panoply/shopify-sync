// @ts-nocheck
import _ from 'lodash'
import anymatch from 'anymatch'
import { join, parse, dirname, basename } from 'path'
import { writeFile, mkdirp } from 'fs-extra'
import { url, asyncForEach, waitFor } from '../config/utils'
import chalk from 'chalk'
import configuration from '../config/config'
import targets from '../config/target'
import ignore from '../config/ignore'
import request from '../config/request'
import { Buffer } from 'buffer'
import clear from 'console-clear'
import log from 'log-update'
import boxen from 'boxen'

/**
 * Download
 *
 * @param {object} options
 * @param {function} callback
 */
export default async function (options, callback) {

  const config = await configuration()
  const target = await targets(config, options)

  if (!options.file) Object.assign(options, config)

  const cwd = process.cwd()
  const dirName = options.dir || 'theme'
  const filter = _.first(options._) ? dirName : null
  const { settings } = ignore(options)
  const { assets } = await request(target, {
    method: 'GET',
    url: `/admin/themes/${target.theme_id}/assets.json`
  })

  let files

  if (filter) files = assets.filter(file => filter.test(file))

  files = settings?.ignore?.length > 0
    ? assets.filter(({ key }) => !anymatch(settings.ignore, key))
    : files || assets

  clear(true)

  let i = 0

  return asyncForEach(files, async ({ key }) => {

    await waitFor(100)

    request(target, {
      method: 'GET',
      url: `/admin/themes/${target.theme_id}/assets.json`,
      params: {
        'asset[key]': key
      }
    }).then(async ({
      asset: {
        attachment,
        value
      }

    }) => {

      const encode = attachment ? 'base64' : 'utf8'
      const content = attachment || value
      const buffer = Buffer.from(content, encode)
      const path = join(cwd, dirName, key || null)

      await mkdirp(join(cwd, dirName, dirname(key)))
      await writeFile(path, buffer)

      if (typeof callback === 'function') callback.apply({ file: parse(path), content })

      log(boxen([
        chalk`{magenta    Store}{dim :} {dim.underline ${target.primary_domain}}     `,
        chalk`{magenta     File}{dim :} {cyan ${basename(key)}}`,
        chalk`{magenta Progress}{dim :} {cyan ${i += 1}} of {cyan ${files.length}}`,
        chalk`{magenta   Output}{dim :} {dim ${dirName}/}{cyan ${dirname(key)}}`
      ].join('\n'), {
        padding: 1,
        margin: 1,
        borderColor: 'gray',
        dimBorder: true,
        // @ts-ignore
        borderStyle: 'round'
      }))

    }).catch(e => {

      problems.push(...[
        chalk`{red Failed} '{red ${e.message}}'`,
        _.isArray(e.data)
          ? e.data.map(i => chalk`{red >} {white.dim ${i}}`)
          : !_.isUndefined(e.data) && chalk`{yellow.dim.italic ${e.data}}`
      ])

    })

  })

}
