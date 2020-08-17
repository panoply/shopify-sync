import { queues } from './model'
import { Queue } from './queue'

/**
 *
 * @param {object} target
 * @param {*} request
 */
export default async function request (target, request) {

  let queue

  if (queues[target.domain]) {
    queue = queues[target.domain]
  } else {
    queue = new Queue()
    queues[target.domain] = queue
  }

  return queue.add(target, request)

}
