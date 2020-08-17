import log from 'fancy-log'
import chalk from 'chalk'
import commands from './config/client'

export default function (resource = '', options, callback) {

  if (typeof resource === 'object') return commands(resource)

  if (!resource) {
    return log(chalk`{red Error! The {bold resource} option is missing}!`)
  }

  if (!options.target) {
    return log(chalk`{red Error! Please define a {bold theme target}!}`)
  }

  const config = Object.assign({
    resource,
    target: '',
    concurrency: 20,
    dir: 'theme',
    files: [],
    forceIgnore: false,
    ignore: []
  }, options)

  return commands(config, callback)

}
