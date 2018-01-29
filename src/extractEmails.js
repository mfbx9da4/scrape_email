const _ = require('lodash')

function extractEmailsFromText (text) {
  // stolen from stack overflow
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi
  return text.match(emailRegex)
}

/**
 * Orders emails by duplicate count
 * Expects array of arrays asn input.
 * Each sub array represents found emails in a page.
 */
function orderEmails (allEmails) {
  // Optimization: Iterate through each item maintain ordered list
  // maybe a priority queue?
  const itemCounts = {}
  const ordereditems = []
  for (let i = 0; i < allEmails.length; i++) {
    for (let j = 0; j < allEmails[i].length; j++) {
      let item = allEmails[i][j]
      // some could be null
      if (item) {
        itemCounts[item] = itemCounts[item] ? itemCounts[item] + 1 : 1
      }
    }
  }
  const tuples = []
  for (let key in itemCounts) {
    tuples.push([key, itemCounts[key]])
  }
  return tuples.sort((a, b) => a[1] < b[1]).map(x => x[0])
}

async function extractEmails (responses) {
  let allEmails = responses.map((text) => {
    const emails = extractEmailsFromText(text)
    if (emails) return emails
  })
  const ordered = orderEmails(allEmails)
  return ordered
}

module.exports = extractEmails
