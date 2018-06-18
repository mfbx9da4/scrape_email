const EventEmitter = require('events');

class ScrapeEvents extends EventEmitter {}

const events = new ScrapeEvents();

module.exports = events
