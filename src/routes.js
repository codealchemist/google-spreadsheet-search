const searchService = require('./services/search')
const auth = require('./services/auth')
const {resolve} = require('path')
const winston = require('winston')
winston.level = 'info'

module.exports = ({app, serverUrl, clientUrl, spreadsheetId, spreadsheetRange}) => {
  // Set redirect URL using current client url.
  auth.init(clientUrl)

  // avoid favicon errors (not available)
  app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
  });

  app.get('/', (req, res) => {
    res.render(resolve('dist/index.html'), {})
  })

  app.get('/:key', (req, res) => {
    res.render(resolve('dist/index.html'), {})
  })

  app.get('/key/:key', (req, res) => {
    const key = req.params.key
    winston.log('info', `Searching for ${key}`)

    searchService
      .get(key, spreadsheetId, spreadsheetRange)
      .then(
        (data) => {
          winston.log('info', 'GOT DATA: ', data)
          res
            .status(200)
            .json(data)
        },
        (error) => {
          winston.log('info', '- ERROR: ', error.message || error.status || error)
          error.recovery = errorRecovery(error)

          res
            .status(401)
            .json(error)
        }
      )
  })

  app.get('/auth/google/callback', (req, res) => {
    const code = req.query.code

    if (!code) {
      res.redirect(`${clientUrl}?error=not-authorized`)
      return
    }

    auth.getNewTokenWebFlow(code, (response) => {
      res.redirect(clientUrl)
    })
  })
}

/**
 * Tries to recover from known errors.
 *
 * @param  {object} error
 */
function errorRecovery (error) {

  // Existing credentials don't provide access to the spreadsheet.
  // Delete stored credentials to be able to get valid ones.
  if (
    error.message === 'The caller does not have permission' ||
    error.message === 'invalid_request' ||
    error.status === 'not-authorized'
  ) {
    auth.deleteCredentials()
    return true
  }

  return false
}
