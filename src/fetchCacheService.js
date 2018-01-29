const timer = require('./timerService')
const fetch = require('isomorphic-fetch')
const config = require('config')
const redis = require('../redis')
const extractEmails = require('./extractEmails')

const CACHE_EXPIRATION = config.get('fetch_cache.expiration')

async function fetchCachedUrl (url, key) {
  key = key || url
  let text = await redis.getAsync(key)
  if (!text) {
    // miss
    const res = await fetch(url)
    text = await res.text()
    await redis.setAsync(url, text, 'EX', CACHE_EXPIRATION)
  }
  return text
}

module.exports = {
  fetchCachedUrl
}
