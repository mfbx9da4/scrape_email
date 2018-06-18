const config = require('config')

const express = require('express')
const path = require('path')
const logger = require('morgan')
const debug = require('debug')('scrape-agents:app')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const app = express()
const index = require('./routes/index')

app.use(compression())

// catch errors not caught in promise chain
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
});

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.json({limit: '10mb'}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

app.use('/', index)

module.exports = app
