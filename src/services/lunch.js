'use strict'
const auth = require('./auth')
const spreadsheet = require('./spreadsheet')
const winston = require('winston')
winston.level = 'debug'

// Define spreadsheet params.
const spreadsheetId = '1pP81mzxvsN5B8EriyJgrWHRha5tMM07D0sya_OTVgX4'
const spreadsheetRange = 'Food!!A1:X100'

// Use default filter.
const filter = require('../filters/default')

/**
 * Gets or asks for required arguments, schedules notification
 * if time is specified, and fires notification.
 * If `filter` function is provided uses it to filter data before
 * setting notification.
 *
 * @param  {function} filter
 */
function get (personName) {
  // Validate params.
  if (!personName) throw new Error('personName is required!')

  filter.setPersonName(personName)
  return getLunch({spreadsheetId, spreadsheetRange, filter: filter.run})
}

function getRows ({spreadsheetId, spreadsheetRange}) {
  return new Promise((resolve, reject) => {
    // Ensure the user gives us access to its Google Drive documents.
    auth.grant((auth) => {
      spreadsheet
        .getRows({auth, spreadsheetId, spreadsheetRange})
        .then((rows) => resolve(rows))
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

function getLunch ({spreadsheetId, spreadsheetRange, filter}) {
  return getRows({spreadsheetId, spreadsheetRange}).then((rows) => {
    if (typeof filter === 'function') {
      rows = filter(rows)
      winston.log('debug', '-- FILTERED ROWS:', rows)
    }

    // Return lunch message.
    const message = getMessage(rows)
    return {
      lunch: message
    }
  })
}

module.exports = {get}