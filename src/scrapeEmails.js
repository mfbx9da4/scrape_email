const { set } = require('./cacheService')
const timer = require('./timerService')
const fetchTopGoogleResults = require('./fetchTopGoogleResults')
const extractEmails = require('./extractEmails')

async function scrapeByQuery (query) {
  let responses, emails
  responses = await fetchTopGoogleResults(query)
  emails = await extractEmails(responses)
  // TODO: should emit event instead of updating db directly
  await set(query, JSON.stringify(emails), 'EX', 24 * 60 * 60 * 7)
  return emails
}

async function scrapeByQueries (queries) {
  return Promise.all(queries.map(scrapeByQuery))
}

module.exports = {
  scrapeByQuery,
  scrapeByQueries
}
