const lunchService = require('./services/lunch') 
const {resolve} = require('path')

module.exports = (app) => {
  // avoid favicon errors (not available)
  app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
  });

  app.get('/:name', (req, res) => { 
    res.sendFile(resolve('src/public/index.html'))
  })

  app.get('/name/:name', (req, res) => { 
    const personName = req.params.name
    console.log(`Requesting lunch for ${personName}`)

    lunchService
      .get(personName)
      .then((lunch) => {
        console.log('-- GOT LUNCH: ', lunch)
        res
          .status(200)
          .json(lunch)
      })
  })
}