const cheerio = require('cheerio')
const { fetchCachedUrl } = require('./fetchCacheService')
const config = require('config')

const BASE_URL = config.get('google_search.base_url')
const FETCH_TOP_X_RESULTS = config.get('google_search.fetch_top_x_results')

function constructQueryUrl (query) {
  const base = '/search?q='
  return `${BASE_URL}${base}${encodeURIComponent(query)}+contact`
}

const fetchTopLinks = async (url) => {
  return fetchCachedUrl(url)
}

async function fetchGoogle (query) {
  const url = constructQueryUrl(query)
  let urlWithOutParams = url.split('&')[0]
  return fetchCachedUrl(url, urlWithOutParams)
}

function emitProgress (events, progress, message, query) {
  const data = {
    type: 'progress',
    query,
    progress: progress,
    total: FETCH_TOP_X_RESULTS + 1,
    message: message || ''
  }
  if (events && typeof(events.emit) === 'function') {
    events.emit('progress', data)
  }
}

async function fetchTopGoogleResults (query, events) {
  // fetch google
  const text = await fetchGoogle(query)
  emitProgress(events, 1, 'Fetched Google for ' + query, query)

  // extract top google results links
  const $ = cheerio.load(text);
  const links = $('h3 > a')
  const linkHrefs = []
  for (let i = 0; i < links.length; i++) {
    let href = $(links[i]).attr('href')
    let url = `${BASE_URL}${href}`

    // Some are absolute urls
    if (href.indexOf('http') === 0) {
      url = href
    }

    linkHrefs.push(url)
    if (i + 1 == FETCH_TOP_X_RESULTS) break
  }

  // fetch top results
  let responses = await Promise.all(linkHrefs.map(async (link, i) => {
    const text = await fetchTopLinks(link)
    emitProgress(events, i + 2, `Fetched Link Number ${i + 1}, ${link}`, query)
    return {link, text}
  }))
  return responses
}

module.exports = fetchTopGoogleResults
