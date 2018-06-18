const WebSocket = require('ws')
const url = require('url')
const {scrapeByQuery} = require('./src/scrapeEmails')
const config = require('config')
const routes = config.get('routes')
const events = require('./src/ScrapeEvents')

const wss = new WebSocket.Server({ port: config.get('wsport') });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);

  wss.clients.forEach(function each(client) {
    console.info('client');
  });

  /**
   * Normalize websocket responses. Use instead of send.
   */
  ws.json = (data) => {
    if (!data.type) {
      throw new Error(`No result type specified ${JSON.stringify(data, null, 2)}`)
    }
    return ws.send(JSON.stringify(data))
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

async function handleQueryByEmail (path, query, ws) {
  events.on('progress', (data) => {
    ws.json(data)
  });
  events.emit('progress', {type: 'progress', progress: 0, total: -1});

  const emails = await scrapeByQuery(query, events)
  ws.json({type: 'end', query, emails});
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
