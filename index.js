'use strict'

const redis = require('./redis')
const { scrapeByQueries } = require('./src/scrapeEmails')

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

async function main () {
  try {
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
    const emails = await scrapeByQueries(queries)
    console.info('✅', _.zip(queries, emails));
  } catch (err) {
    redis.quit()
    throw err
  }
  redis.quit()
}

main()
