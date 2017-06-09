const auth = require('./auth')
const spreadsheet = require('./spreadsheet')
const imageSearch = require('./image-search')
const cache = require('./cache')
const winston = require('winston')
winston.level = 'info'

// Use default filter.
const filter = require('../filters/default')

/**
 * Get lunch for passed person name.
 *
 * @param {string} personName
 */
function get (personName, spreadsheetId, spreadsheetRange) {
  // Validate params.
  if (!personName) throw new Error('personName is required!')

  filter.setPersonName(personName)
  return getLunch({spreadsheetId, spreadsheetRange, filter: filter.run})
}

function getLunch ({spreadsheetId, spreadsheetRange, filter}) {
  return getRows({spreadsheetId, spreadsheetRange}).then((rows) => {
    if (typeof filter === 'function') {
      rows = filter(rows)
      winston.log('debug', '-- FILTERED ROWS:', rows)
    }

    // Return lunch message.
    const message = getMessage(rows)
    const foodName = message.replace(/^[a-z]+ - /i, '')
    return imageSearch
      .get(foodName)
      .then((image) => {
        return {
          lunch: message,
          image
        }
      })
  })
}

function getRows ({spreadsheetId, spreadsheetRange}) {
  return new Promise((resolve, reject) => {
    // If we have cached results for today return them.
    const rows = cache.get()
    winston.log('debug', 'CACHED ROWS', rows)
    if (rows) return resolve(rows)

    // Ensure the user gives us access to its Google Drive documents.
    auth.grant((auth) => {
      if (auth.status === 'not-authorized') reject(auth)

      spreadsheet
        .getRows({auth, spreadsheetId, spreadsheetRange})
        .then(
          (rows) => {
            cache.set(rows) // Update cache.
            winston.log('debug', 'GOT ROWS', rows)
            resolve(rows)
          },
          (error) => reject(error)
        )
    })
  })
}

function getMessage (rows) {
  const defaultMessage = '(EMPTY)'
  if (!rows || !rows.length) return defaultMessage

  // Support string responses.
  if (typeof rows === 'string') return rows

  // Multi value response.
  if (rows.length > 1) return JSON.stringify(rows)

  // Single value response.
  return rows[0]
}

module.exports = {get, getRows}
