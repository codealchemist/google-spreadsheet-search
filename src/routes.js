const lunchService = require('./services/lunch')
const auth = require('./services/auth')
const {resolve} = require('path')

module.exports = ({app, serverUrl}) => {
  // avoid favicon errors (not available)
  app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
  });

  app.get('/', (req, res) => { 
    res.render(resolve('src/public/index.html'), {
      serverUrl: serverUrl
    })
  })

  app.get('/:name', (req, res) => { 
    res.render(resolve('src/public/index.html'), {
      serverUrl: serverUrl
    })
  })

  app.get('/name/:name', (req, res) => { 
    const personName = req.params.name
    console.log(`Requesting lunch for ${personName}`)

    lunchService
      .get(personName)
      .then(
        (lunch) => {
          console.log('GOT LUNCH: ', lunch)
          res
            .status(200)
            .json(lunch)
        },
        (error) => {
          console.log('- ERROR: ', error.message)
          errorRecovery(error)

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
      res.redirect(`${serverUrl}?error=not-authorized`)
      return
    }

    auth.getNewTokenWebFlow(code, (response) => {
      res.redirect(serverUrl)
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
  if (error.message === 'The caller does not have permission') {
    auth.deleteCredentials()
  }
}