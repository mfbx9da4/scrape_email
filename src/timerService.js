'use strict'

async function timer (fnOrMessage, fn) {
  const start = Date.now()
  let message = 'Took'
  if (typeof fnOrMessage === 'function') {
    await fnOrMessage()
  } else {
    message = fnOrMessage
    await fn()
  }
  const end = Date.now()
  const diff = end - start
  console.info(`${message} took ${diff}`)
}

module.exports = timer
