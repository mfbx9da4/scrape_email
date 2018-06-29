const config = require('config')
const bluebird = require('bluebird')
const Redis = require('redis')
bluebird.promisifyAll(Redis.RedisClient.prototype)
bluebird.promisifyAll(Redis.Multi.prototype);

let client = null

const params = JSON.parse(JSON.stringify(config.get('redis')))

if (process.env.IS_USING_DOCKER_COMPOSE) {
	params.host = params.docker_compose_host
}
delete params.docker_compose_host

client = Redis.createClient(params)

client.on('error', err => {
  console.log(`redis.js:Redis ${err}`)
})

module.exports = client
