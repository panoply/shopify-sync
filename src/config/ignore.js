import chalk from 'chalk'

/**
 * Ignore
 *
 * @export
 * @param {object} settings
 * @param {(boolean|object)} ignored
 * @returns
 */
export default function (settings, ignored = {
  count: 0,
  files: null,
  log: null,
  base: /[/\\]\./
}) {

  if (settings.ignore && settings.forceIgnore) {
    ignored.count = settings.ignore.length
    ignored.log = settings.ignore.join(chalk`\n\t {whiteBright - }`)
    settings.ignore.push(ignored.base)
    ignored.files = settings.ignore
  }

  return { settings, ignored }

}
