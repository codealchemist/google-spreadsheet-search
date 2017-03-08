'use strict'
const lunchService = require('./services/lunch')
const auth = require('./services/auth')
const {resolve} = require('path')

module.exports = ({app, serverUrl, clientUrl, spreadsheetId, spreadsheetRange}) => {
  // Set redirect URL using current client url.
  auth.init(clientUrl)

  // avoid favicon errors (not available)
  app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
  });

  app.get('/', (req, res) => {
    res.render(resolve('src/public/index.html'), {})
  })

  app.get('/:name', (req, res) => {
    res.render(resolve('src/public/index.html'), {})
  })

  app.get('/name/:name', (req, res) => {
    const personName = req.params.name
    console.log(`Requesting lunch for ${personName}`)

    lunchService
      .get(personName, spreadsheetId, spreadsheetRange)
      .then(
        (lunch) => {
          console.log('GOT LUNCH: ', lunch)
          res
            .status(200)
            .json(lunch)
        },
        (error) => {
          console.log('- ERROR: ', error.message || error.status || error)
          error.recovery = errorRecovery(error)

          res
            .status(401)
            .json(error)
        }
      )
  })

  app.get('/auth/google/callback', (req, res) => {
    const code = req.query.code
    const personName = req.query.personName

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
