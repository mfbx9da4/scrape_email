'use strict'

const express = require('express')
const router = express.Router()
const config = require('config')
const routes = config.get('routes')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const csv = require("fast-csv");
const events = require('../src/ScrapeEvents')

const {scrapeByQuery} = require('../src/scrapeEmails')

router.get(routes.home, (req, res) => {
  res.render('index', { title: 'Home' })
})

router.get(routes.batch, (req, res) => {
  res.render('batch', { title: 'Batch' })
})

/**
 * API Routes
 */

router.get(routes.queryByEmail, async (req, res) => {
  const out = await scrapeByQuery(req.query.q)
  res.json(out)
})

router.post(routes.queryByEmailBatch, multipartMiddleware, async (req, res, err) => {
  console.log('req.files', req.files)
  const batchId = 'UUID1234' + Date.now()

  let total_started = 0
  let total_finished = 0
  let all_started = false
  const items = []

  csv
    .fromPath(req.files.file.path)
    .on("error", async function (err){
      next(err)
    })
    .on("data", async function (data){
      const query = data[0]
      total_started += 1
      const emails = await scrapeByQuery(query, events)
      const item = {query, emails}
      items.push(item)
      events.emit(`batch_progress:${batchId}`, item)
      total_finished += 1
      console.log('finish query', query)

      if (all_started && total_finished === total_started) {
        console.log('finished')
        events.emit(`batch_complete:${batchId}`, items)
      }
    })
    .on("end", async function (){
      all_started = true
      console.log("Started all queries");
    })

  res.json({type: 'success', message: 'ok', batchId})
})

module.exports = router
