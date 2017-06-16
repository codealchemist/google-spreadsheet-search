const path = require('path')
const nconf = require('nconf')

// Read config from different sources in order.
nconf
  .argv()
  .env()
  .file({file: path.join(__dirname, '../config.json')})

module.exports = nconf
