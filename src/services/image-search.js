const googleSearch = require('googleapis').customsearch('v1').cse.list
const winston = require('winston')
const path = require('path')
const config = require('../config')
winston.level = 'info'

function search (terms, callback) {
  googleSearch({
    cx: config.get('SEARCH_CX') || config.get('search').cx,
    auth: config.get('SEARCH_KEY') || config.get('search').key,
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

      let image = null
      try {
        image = response.items[0].pagemap.cse_image[0]
      } catch(e) {}

      resolve(image)
    })
  })
}

module.exports = {search, get}
