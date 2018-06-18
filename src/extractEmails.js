const _ = require('lodash')

function extractEmailsFromText (text) {
  // const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi
  // const emailRegex = /[a-zA-Z0-9.\-_+#~!$&\',;=:]+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi
  // for ref https://stackoverflow.com/a/2049510/1376627
  const emailRegex = /[a-zA-Z0-9.\-_+#~!$&\']+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi
  // Remove encoding of the href
  const decodedText = unescape(text)
  let matches = decodedText.match(emailRegex)
  if (!matches) return null
  let validMatches = []

  // TODO: this should be part of the regex
  const imageExts = new Set(['JPG', 'JPEG', 'TIFF', 'GIF', 'BMP', 'PNG', 'PPM'])
  const isImage = (email) => {
    const parts = email.split('.')
    const last = parts[parts.length - 1].toUpperCase()
    return imageExts.has(last)
  }
  for (let i = 0; i < matches.length; i++) {
    match = matches[i]
    // Remove mailto: links
    const parts = match.split('mailto:')
    if (parts.length > 1) {
      const lastIndex = parts.length - 1
      match = parts[lastIndex]
    }
    if (!isImage(match)) {
      validMatches.push(match)
    }
  }
  return validMatches
}

/**
 * Orders emails by duplicate count
 * Expects array of arrays asn input.
 * Each sub array represents found emails in a page.
 */
function orderEmails (allEmails) {
  if (!allEmails) { return }
  const itemCounts = {}
  for (let i = 0; i < allEmails.length; i++) {
    if (!allEmails[i] || !allEmails[i].emails.length) { continue }
    let {link, emails} = allEmails[i]
    for (let j = 0; j < emails.length; j++) {
      let email = emails[j]
      // console.info('link, email', link, email);
      // some could be null
      if (email) {
        itemCounts[email] = itemCounts[email] || {}
        let {count = 1, sources = {}} = itemCounts[email]
        count += 1
        sources[link] = 1
        itemCounts[email].count = count
        itemCounts[email].sources = sources
      }
    }
  }

  // TODO: remove, sorts based on counts
  // const sorted = Object.keys(itemCounts).sort((p, q) => {
  //   const a = itemCounts[p]
  //   const b = itemCounts[q]
  //   return a - b
  // })
  return itemCounts
}

async function extractEmails (responses, events) {
  let allEmails = responses.map((res, i) => {
    const { link, text } = res
    const emails = extractEmailsFromText(text)
    if (emails) return {link, emails}
  })
  const ordered = orderEmails(allEmails)
  return ordered
}

module.exports = extractEmails
