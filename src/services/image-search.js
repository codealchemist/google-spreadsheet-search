'use strict'
const googleSearch = require('googleapis').customsearch('v1').cse.list
const winston = require('winston')
const path = require('path')
const credentialsFile = path.join(__dirname, '/../../ids.json')
const credentials = require(credentialsFile)
winston.level = 'info'

function search (terms, callback) {
  googleSearch({
    cx: credentials.search.cx,
    auth: credentials.search.key,
    imgSize: 'medium',
    imgType: 'photo',
    num: 1,
    hq: 'comida',
    q: terms
  }, callback)
}

function get (terms) {
  return new Promise((resolve, reject) => {
    search(terms, (err, response) => {
      if (err) return reject(err)

      if (!response.items || !response.items.length || !response.items[0].pagemap.cse_image.length) {
        resolve(null)
        return
      }

      const image = response.items[0].pagemap.cse_image[0]
      resolve(image)
    })
  })
}

module.exports = {search, get}
