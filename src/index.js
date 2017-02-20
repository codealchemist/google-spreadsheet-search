'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const http = require('http')
const app = express()
const path = require('path')
const fs = require('fs')
const ip = require('ip')
const localIp = ip.address()

// print ascii art
var artFile = path.join(__dirname, '/ascii-art.txt')
var art = fs.readFileSync(artFile, 'utf8')
console.info(art)

// set ip and port
var port = process.env.PORT || process.env.port || 9200

// set port
app.set('port', port)

app.use(morgan('dev')) // logger
app.use(bodyParser.json())
app.set('json spaces', 2)

// static routes
app.use(express.static(__dirname + '/public/'));
app.use('/img', express.static(__dirname + '/public/img'));

// set routes
require('./routes')(app)

// start server
http.createServer(app).listen(app.get('port'), function () {
  console.info()
  console.info(`✔ Express server listening at http://${localIp}:${port}`)
  console.info('-'.repeat(80))
})

module.exports = app