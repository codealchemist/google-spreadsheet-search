const fs = require('fs')
const {resolve} = require('path')
const readline = require('readline')
const GoogleAuth = require('google-auth-library')
const open = require('open')
const winston = require('winston')
const config = require('../config')

winston.level = 'info'

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.credentials.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const TOKEN_DIR = (
  config.get('HOME') ||
  config.get('HOMEPATH') ||
  config.get('USERPROFILE')
) + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.credentials.json'

const clientSecret = config.get('CLIENT_SECRET') || config.get('client').secret
const clientId = config.get('CLIENT_ID') || config.get('client').id

const auth = new GoogleAuth()
let oauth2Client

module.exports = {authorize, getNewTokenWebFlow, deleteCredentials, init}

// ----------------------------------------------------------------------

function init (clientUrl) {
  const redirectUrl = getRedirectUrl(clientUrl)
  oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
}

/**
 * Completes the authentication process and calls passed callback
 * with the obtained auth credentials.
 * This credentials object is used to access documents using the
 * Google API.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (callback) {
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      const authObj = getAuthObject()
      callback(authObj)
    } else {
      oauth2Client.credentials = JSON.parse(token)
      callback(oauth2Client)
    }
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
// function getNewToken (oauth2Client, callback) {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES
//   })

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   })

//   // Display and open URL to authenticate with Google.
//   console.log('-'.repeat(80))
//   open(authUrl, (error) => {
//     if (error) {
//       console.log('Authorize this app by visiting this url: ', authUrl)
//       console.log()
//     }
//   })

//   rl.question('Enter the code obtained on the authorization page: ', function (code) {
//     oauth2Client.getToken(code, function (err, token) {
//       if (err) {
//         console.log('Error while trying to retrieve access token', err)
//         console.log('-'.repeat(80))
//         console.log()
//         return
//       }

//       console.log('-'.repeat(80))
//       console.log()
//       oauth2Client.credentials = token
//       storeToken(token)
//       callback(oauth2Client)
//     })
//   })
// }

function getAuthObject () {
  const authUrl = oauth2Client.generateAuthUrl({
    scope: SCOPES
  })

  return {
    status: 'not-authorized',
    url: authUrl
  }
}

function getNewTokenWebFlow (code, callback) {
  oauth2Client.getToken(code, function (err, token) {
    if (err) {
      winston.log('debug', 'Error while trying to retrieve access token', err)
      winston.log('debug', '-'.repeat(80))
      winston.log('debug', '')
      return
    }

    winston.log('debug', '- Got user authorization.')
    oauth2Client.credentials = token
    storeToken(token)
    callback({
      status: 'authorized'
    })
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token))
  winston.log('debug', `Token stored to ${TOKEN_PATH}`)
}

function deleteCredentials () {
  fs.unlink(TOKEN_PATH, () => {
    console.log('Error recovery: Existing credentials removed.')
  })
}

function getRedirectUrl (clientUrl) {
  return `${clientUrl}/auth/google/callback`
}
