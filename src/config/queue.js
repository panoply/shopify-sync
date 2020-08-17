import _ from 'lodash'
import Promise from 'bluebird'
import axios from 'axios'
import { log, url } from './utils'


export function Queue() {

  let inFlight = 0
  let rate = 0
  let max = 40
  let isProcessing = false


  /**
   * @type {array}
   */
  const list = []

  /**
   * Add request to Queue
   *
   * @param {object} target
   * @param {object} request
   * @returns {Promise}
   */
  function add (target, request) {

    return new Promise((resolve, reject) => {
      list.push({ target, request, resolve, reject })
      if (!isProcessing) process()
    })

  }

  /**
   * Process Queue
   *
   * @async
   * @private
   */
  async function process()  {

    isProcessing = true

    do {

      let headroom = max - (rate + inFlight)
      if (headroom <= 0) headroom = 0

      let exponent = (headroom * headroom)
      if (exponent <= 0.9) exponent = 0.9

      const throttle = 500 / exponent
      const inject = list.shift()

      await Promise.delay(throttle)

      request(inject)

    } while (list.length > 0)

    isProcessing = false

  }

  /**
   * Queue Request
   *
   * @private
   * @param {object} param
   */
  async function request({
    target,
    request,
    reject,
    resolve
  })  {

    let result = null

    inFlight += 1

    try {

      const settings = Object.assign({}, request, {
        url: `${url(target)}${request.url}`
      })

      result = await axios(settings)

    } catch (error) {

      if (error.statusText === 'Too Many Requests') {

        log('Exceeded Shopify API limit, will retry...', 'yellow')

        return list.unshift({
          target,
          request,
          resolve,
          reject
        })

      } else {

        return reject(handleErrors(request, error))

      }
    }

    inFlight -= 1

    await resolve(result.data)

    if (result.data.errors) return reject(result.data.errors)

    let limit

    limit = result.headers['x-shopify-shop-api-call-limit']
    limit = limit.split('/')

    rate = parseInt(limit[0], 10)
    max = parseInt(limit[1], 10)

  }

  /**
   * Error Handler
   *
   * @private
   * @param {object} request
   * @param {object} error
   */
  function handleErrors(request, error)  {

    let data = ''
    let message = ''

    if (!_.has(error.response, 'data')) {
      return {
        data: error.stack,
        message: error.name
      }
    }

    const response = error.response.data

    // If Response has any errors we can log
    if (response?.errors) {
      // If error is File or API related
      if (response.errors.asset) {
        message = request.data.asset.key
        data = response.errors.asset
      } else {
        data = response.errors
        // API errors
        if (request.data) {
          if (request.data.asset) {
            message = `${request.data.asset.key} failed to upload`
          } else {
            message = `${request.method.toUpperCase()} ${request.url}`
          }
        }
      }
    } else {
      message = `FAILED! ${error}`
      data = error.statusText
    }

    return {
      message,
      data
    }

  }

}
