'use strict'

const _ = require('lodash')
const redis = require('./redis')
const { scrapeByQueries } = require('./src/scrapeEmails')
const { readFile, writeFile } = require('./src/fs')
const events = require('./src/ScrapeEvents')
const argv = require('minimist')(process.argv.slice(2));
const csv = require("fast-csv");

const OUTFILE = './out/out.json'

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

async function getQueries (argv) {
  if (argv.queryFile) {
    if (argv.queryFile.indexOf('.csv') > -1) {
      return fromCsv(argv.queryFile)
    }
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

async function fromCsv (file) {
  const queries = []
  return new Promise((res, rej) => {
    csv
      .fromPath(file)
      .on("error", async function (err){
        const message = {type: "error", message: "Error with file format. Should be a csv."}
        message.raw = err.message
        // Delay as the client might not be connected yet
        setTimeout(function() {
          events.emit(`batch_progress:${batchId}`, message)
        }, 1000)
      })
      .on("data", async function (data){
        // first column
        const query = data[0]
        if (!query) return
        queries.push(query)
      })
      .on("end", async function (){
        return res(queries)
      })
  })
}

async function main (argv) {
  try {
    const queries = await getQueries(argv)
    console.log('queries', queries)
    const emails = await scrapeByQueries(queries, events)
    const res = _.zip(queries, emails)
    console.info('✅', res);
    await writeFile(OUTFILE, JSON.stringify(res, null, 2))
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

// Usage yarn runOnce --queryFile fixtures/inputs/queries_small.csv
main(argv)
