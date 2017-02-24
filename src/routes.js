const lunchService = require('./services/lunch') 
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
      .then((lunch) => {
        console.log('-- GOT LUNCH: ', lunch)
        res
          .status(200)
          .json(lunch)
      })
  })
}