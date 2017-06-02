const fs = require('fs')
const prettyMs = require('pretty-ms')
const winston = require('winston')

winston.level = 'info'
const ttl = 8 * 60 * 60 * 1000 // 8 hours.
const fileName = '.lunch-notifier-cache.json'
const cachePath = getCachePath()
const cacheFile = `${cachePath}/${fileName}`
const memoryRows = null
const lastUpdatedTime = null

function getCachePath () {
  return process.env.CACHE_PATH ||
    process.env.HOME ||
    process.env.HOMEPATH ||
    process.env.USERPROFILE
}

function getLastUpdateTime () {
  // Try with memory first.
  if (lastUpdatedTime) {
    winston.log('debug', 'IN MEMORY CACHE last updated at', lastUpdatedTime)
    return lastUpdatedTime
  }

  // We can still have cache in the file system.
  let stats
  try {
    stats = fs.statSync(cacheFile)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e

    winston.log('info', 'NO CACHE AVAILABLE')
    return false
  }

  // Cache is available.
  // Check if its time to live is valid.
  const mtime = new Date(stats.mtime)
  return mtime;
}

function set (rows) {
  try {
    fs.mkdirSync(cachePath)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }

  memoryRows = rows
  lastUpdatedTime = (new Date()).getTime()
  fs.writeFile(cacheFile, JSON.stringify(rows))
  winston.log('info', `CACHE SAVED to ${cacheFile}`)
}

function get () {
  const mtime = getLastUpdateTime()
  if (!mtime) return false

  // Check for cache age.
  const now = (new Date()).getTime()
  const cacheLife = now - mtime
  if (cacheLife > ttl) {
    winston.log('info', `CACHE IS TOO OLD: ${cacheLife} > ${ttl}`)
    return false
  }

  const timeLeft = prettyMs(Math.abs(cacheLife - ttl))
  winston.log('info', `CACHE IS VALID. Last updated on: ${mtime}.`)
  winston.log('info', `CACHE will update in ${timeLeft}.`)

  // Try with memory first.
  if (memoryRows) return memoryRows

  // If the app was reloaded we can still have cache in the file system.
  const rows = fs.readFileSync(cacheFile)
  return JSON.parse(rows)
}

module.exports = {get, set}
