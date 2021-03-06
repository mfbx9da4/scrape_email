const { set, redis } = require('./cacheService')
const timer = require('./timerService')
const fetchTopGoogleResults = require('./fetchTopGoogleResults')
const extractEmails = require('./extractEmails')

async function scrapeByQuery (query, events) {
  // TODO: should load from cache if the query has been resolved!
  let responses, emails
  responses = await fetchTopGoogleResults(query, events)
  emails = await extractEmails(responses, events)
  events.emit('end', {type: 'end', query, emails});
  if (redis.connected) {
    await set(query, JSON.stringify(emails), 'EX', 24 * 60 * 60 * 7)
  }

  return emails
}

async function scrapeByQueries (queries, events) {
  return Promise.all(queries.map((query) => {
    return scrapeByQuery(query, events)
  }))
}

module.exports = {
  scrapeByQuery,
  scrapeByQueries
}
