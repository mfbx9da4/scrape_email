const cheerio = require('cheerio')
const { fetchCachedUrl } = require('./fetchCacheService')
const config = require('config')

const BASE_URL = config.get('google_search.base_url')
const FETCH_TOP_X_RESULTS = config.get('google_search.fetch_top_x_results')

function constructQueryUrl (query) {
  const base = '/search?q='
  return `${BASE_URL}${base}${query}+contact`
}

const fetchTopLinks = async (href) => {
  let urlWithOutParams = href.split('&')[0]
  let url = `${BASE_URL}${href}`
  return fetchCachedUrl(url, urlWithOutParams)
}

async function fetchGoogle (query) {
  const url = constructQueryUrl(query)
  return fetchCachedUrl(url)
}

async function fetchTopGoogleResults (query) {
  // fetch google
  const text = await fetchGoogle(query)

  // extract top google results links
  const $ = cheerio.load(text);
  const links = $('h3 > a')
  const linkHrefs = []
  for (let i = 0; i < links.length; i++) {
    linkHrefs.push($(links[i]).attr('href'))
    if (i + 1 == FETCH_TOP_X_RESULTS) break
  }

  // fetch top results
  let responses = await Promise.all(linkHrefs.map(fetchTopLinks))
  return responses
}

module.exports = fetchTopGoogleResults
