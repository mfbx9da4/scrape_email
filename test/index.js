'use strict'

// make sure we're not running against non-test database
// (knexfile.js config is based on node env)
process.env.NODE_ENV = 'test'

const chai = require('chai')
global.expect = chai.expect
chai.use(require('sinon-chai'))
chai.use(require('chai-as-promised'))
chai.use(require('chai-fs'))

before(async function () {
})

beforeEach(async function () {
})

afterEach(async function () {
})
