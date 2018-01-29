'use strict'

const request = require('supertest')
const app = require('../../app')
const cache = require('../../src/cacheService')

describe('index', () => {
  it('/', async () => {
    await request(app).get('/').expect(200)
  })
})

describe('/api', () => {
  beforeEach(async () => {
    await cache.set('https://www.google.co.uk/search?q=asdf+contact', '<h3><a href="/url=http://asdf.com"></a></h3>', 'EX', 39)
    await cache.set('/url=http://asdf.com', 'asdf@asdf.com asdf2@asdf.com', 'EX', 39)
  })

  it('/search/email?q=asdf', async () => {
    let res
    res = await request(app)
      .get('/api/v1/search/email?q=asdf')
      .expect(200)
    expect(res.body).to.eql(["asdf@asdf.com", "asdf2@asdf.com"])
  })
})
