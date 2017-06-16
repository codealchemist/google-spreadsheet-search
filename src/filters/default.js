const dateFormat = require('dateformat')
const dateFormatting = process.env.DATE_FORMATTING || 'mmm d'
let key

// Set rows filter.
function run (rows) {
  const currentDate = dateFormat(new Date(), dateFormatting)

  // Filter rows.
  let filteredRows = []

  // Iterate rows.
  let currentDateCol
  rows.some((row, indexRows) => {
    // Get col for current data.
    if (indexRows === 0) {
      row.some((value, indexRow) => {
        if (value.toLowerCase() === currentDate.toLowerCase()) {
          currentDateCol = indexRow
          return true
        }
      })
      return false
    }

    // Iterate row values.
    if (row[0].toLowerCase() !== key.toLowerCase()) return false

    // Add lunch data for current date for selected person.
    const lunch = row[currentDateCol] || `Oops, there's no lunch for you today buddy!`
    filteredRows.push(lunch)
  })

  if (!filteredRows) {
    console.log(`Sorry ${key}, I wasn't able to find your food for today.`)
    process.exit()
  }
  return filteredRows
}

function setKey (_key) {
  key = _key
}

module.exports = {
  run,
  setKey
}
