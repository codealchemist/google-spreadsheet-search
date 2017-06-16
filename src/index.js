const http = require('http')
const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const ip = require('ip')
const config = require('./config')

const app = express()
const localIp = ip.address()

// print ascii art
var artFile = path.join(__dirname, '/ascii-art.txt')
var art = fs.readFileSync(artFile, 'utf8')
console.info(art)

// Set config params.
const port = config.get('PORT') || config.get('port') || 9200
const clientUrl = config.get('CLIENT_URL') || `http://localhost:${port}`
const spreadsheetId = config.get('SPREADSHEET_ID') || config.get('spreadsheet').id
const spreadsheetRange = config.get('SPREADSHEET_RANGE') || config.get('spreadsheet').range
console.log(`
  CONFIG:
  - Server Port: ${port}
  - Client URL: ${clientUrl}
  - Spreadsheet ID: ${spreadsheetId}
  - Spreadsheet Range: ${spreadsheetRange}
`)

// set port
app.set('port', port)

app.use(bodyParser.json())
app.set('json spaces', 2)
app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '/../dist'))

// static routes
app.use(express.static(path.join(__dirname, '/../dist/')))

// set routes
const serverUrl = `http://${localIp}:${port}`
require('./routes')({app, serverUrl, clientUrl, spreadsheetId, spreadsheetRange})

// start server
http.createServer(app).listen(app.get('port'), function () {
  console.info()
  console.info(`✔ Express server listening at ${serverUrl}`)
  console.info('-'.repeat(80))
})

module.exports = app
