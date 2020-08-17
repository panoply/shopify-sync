import { join } from 'path'
import { readFile } from 'fs-extra'

export default async function () {

  let config

  try {

    const cwd = process.cwd()
    const file = join(cwd, '.shopifysync.json')

    config = await readFile(file, 'utf8')

  } catch (err) {
    throw new Error('The \'.shopifysync.json\' configuration is missing!')
  }

  try {
    config = JSON.parse(config)
  } catch (err) {
    throw new Error('Your \'.shopifysync.json\' file is corrupt. JSON failed to parse')
  }

  return config

}
