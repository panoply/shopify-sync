const _ = require('lodash')
const Promise = require('bluebird')
const inquirer = Promise.promisifyAll(require('inquirer'))

module.exports = async function (config, options, target = null) {

  const target_name = options.target || null

  console.log(target_name)

  if (_.isArray(config.targets)) {
    if (target_name) {
      target = _.find(config.targets, { target_name })

      if (!target) throw new Error(`Could not find target '${targetName}'`)

    } else {

      const choices = _.map(config.targets, (target) => {
        return `[${target.target_name}] - '${target.theme_name}' at ${target.domain}.myshopify.com`
      })

      if (config.targets.length > 1) {

        const choice = await inquirer.prompt([{
          type: 'list',
          name: 'target',
          message: 'Select target',
          default: null,
          choices
        }])

        target = config.targets[_.indexOf(choices, choice.target)]

      } else if (config.targets.length === 1) {

        target = _.first(config.targets)

      }
    }
  } else {

    throw new Error(`No targets defined in the '.shopifysync' file`)
  }

  const buffer = Buffer.from(`${target.api_key}:${target.password}`)
  target.auth = `Basic ${buffer.toString('base64')}`

  return target

}
