const WebSocket = require('ws')
const url = require('url')
const {scrapeByQuery} = require('./src/scrapeEmails')
const config = require('config')
const routes = config.get('routes')
const events = require('./src/ScrapeEvents')

const wss = new WebSocket.Server({ port: config.get('wsport') });

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.id = 'wsid:' + wss.clients.size

  wss.clients.forEach(function each(client) {
    console.info('client', client.id, client.readyState === WebSocket.OPEN);
  });

  /**
   * Normalize websocket responses. Use instead of send.
   */
  ws.json = (data) => {
    if (!data.type) {
      throw new Error(`No result type specified ${JSON.stringify(data, null, 2)}`)
    }
    if (ws.readyState === WebSocket.OPEN) {
      return ws.send(JSON.stringify(data))
    } else {
      // console.log('dont send', data.type, 'to', ws.id)
    }
  }

  ws.on('message', async function incoming(message) {
    console.log('received: %s', message);
    const data = JSON.parse(message)

    const { path, query } = data

    if (path === routes.queryByEmail) {
      return handleQueryByEmail(path, query, ws)
    } else if (path === routes.batchProgress) {
      return handleBatchProgress(path, query, ws)
    }

    return ws.json({type: 'error', message: 'Path not found'})
  });

  ws.json({type: 'init', status: 'Connected 🎉'});
});


/* Detect and close broken connections */
const interval = setInterval(function ping() {
  console.log('-----')
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log('kill dead connection', ws.id)
      return ws.terminate()
    }
    console.log('alive', ws.id)
    ws.isAlive = false
    ws.ping(noop)
  });
}, 30000);

async function handleQueryByEmail (path, query, ws) {
  events.on('end', (data) => {
    ws.json(data)
  });
  events.on('progress', (data) => {
    ws.json(data)
  });
  events.emit('progress', {type: 'progress', progress: 0, total: -1});

  console.log('path, query', path, query)
  const emails = await scrapeByQuery(query, events)
}

async function handleBatchProgress (path, query, ws) {
  events.on(`batch_progress:${query}`, (data) => {
    ws.json({type: 'batch_progress', batchId: query, data})
  });
  events.on(`batch_complete:${query}`, (data) => {
    ws.json({type: 'batch_complete', batchId: query, data})
  });
}

module.exports = wss
