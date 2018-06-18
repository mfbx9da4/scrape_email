'use strict'

const _ = require('lodash')
const redis = require('./redis')
const { scrapeByQueries } = require('./src/scrapeEmails')
const { readFile } = require('./src/fs')
const events = require('./src/ScrapeEvents')
const argv = require('minimist')(process.argv.slice(2));

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

async function getQueries (argv) {
  if (argv.queryFile) {
    return JSON.parse(readFile(argv.queryFile))
  }
  const queries = [
    'imperial homes world wide',
    'Alexander May',
    'Chancellors',
    'Bidmead Cook',
    'Allen & Harris',
    'Belvoir - Estate & Lettings Specialist',
    'Campbells HQ',
    'Allen & Harris'
  ]
  return queries
}

async function main (argv) {
  try {
    const queries = await getQueries(argv)
    console.log('queries', queries)
    const emails = await scrapeByQueries(queries, events)
    console.info('✅', _.zip(queries, emails));
  } catch (err) {
    redis.quit()
    throw err
  }

  quitRedis()
}

function quitRedis () {
  // TODO: despite using promises on SET commands
  // this hack is required, or at least on some machines, otherwise
  // AbortError: SET can't be processed. The connection is already closed.
  // Can be seen.
  setTimeout(() => {
    console.info('QUITREDIS');
    redis.quit()
  }, 1000)
}

main(argv)
