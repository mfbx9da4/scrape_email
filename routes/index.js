'use strict'

const express = require('express')
const router = express.Router()

const {scrapeByQuery} = require('../src/scrapeEmails')

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Home' })
})

router.get('/api/v1/search/email', async (req, res) => {
  const out = await scrapeByQuery(req.query.q)
  res.json(out)
})

module.exports = router
