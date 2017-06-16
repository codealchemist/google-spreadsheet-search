import bean from 'bean'
import alertify from 'alertify/alertify'
import El from './el'
import SearchService from './search-service'
import analytics from './analytics'

module.exports = class App {
  constructor () {
    this.$key = new El('key')
    this.$keyContainer = new El('key-container')
    this.$loading = new El('loading')
    this.$resultContainer = new El('result-container')
    this.$resultDisplay = new El('result-display')
    this.$keyRender = new El('key-display')
    this.$background = new El('background')
    this.$date = new El('date')

    this.setDate()
    this.setEvents()
    if (this.hasErrors()) {
      this.deleteSession()
      this.displayErrors()
      return
    }

    this.autoload()
    this.restoreSession()

    // Display name container.
    this.$keyContainer.style('opacity', 1)
  }

  setDate () {
    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      weekday: 'short',
      month: 'short',
      year: 'numeric'
    }).split(' ')

    console.log(date)
    const dayName = date[0].replace(',', '')
    const dayNumber = date[1]
    const month = date[2]
    // const year = date[3]

    console.log('DATE:', `${month} ${dayNumber}, ${dayName}`)
    this.$date
      .html(`<b>${month} ${dayNumber}</b>, ${dayName}`)
      .appear()
  }

  getParameterByName (name, url) {
    if (!url) {
      url = window.location.href
    }

    name = name.replace(/[[\]]/g, '\\$&')
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  hasErrors () {
    if (window.location.search.match(/error=/i)) return true
  }

  displayErrors () {
    const errorsMap = {
      'not-authorized': `Sorry, you're not authorized to access the spreadsheet.`
    }

    const errorCode = this.getParameterByName('error', window.location.href)
    const errorMessage = errorsMap[errorCode] || 'You just broke the Internet :O'
    alertify.error(errorMessage)
  }

  autoload () {
    if (!window.location.pathname.match(/[a-z]+/i)) return false

    let url = window.location.href
    let baseUrl = `${window.location.origin}/`
    let key = decodeURI(url.replace(baseUrl, '')).trim()

    // Search.
    this.search(key)
  }

  search (key) {
    this.$key.hide()
    this.$loading.show()

    analytics.track({action: 'search', label: key})

    const searchService = new SearchService(key)
    searchService.get(
      (response) => {
        if (this.handleErrors(response, key)) return
        this.render(key, response)
      },

      // Connection error.
      (error) => {
        alertify.error('Oops... Something broke at the kitchen.', 0)
        console.error(error)
        this.$loading.hide()
        this.$key.val('').show().focus()
      }
    )
  }

  handleErrors (response, name) {
    // Open authorization page if required.
    // This happens when there are no credentials stored.
    if (response.status === 'not-authorized') {
      alertify.success('Redirecting to authorization page...')
      console.log('Hey! After authorizing the app you should be taken back to it and your search will run automatically ;)')
      this.saveSession(name)
      window.location.href = response.url
      return true
    }

    // Invalid request.
    // Usually happens when the credentials are wrong.
    if (response.code === 400) {
      alertify.error('Oops... Something broke at the kitchen.', 0) // TODO: parameterize this
      console.log('Psss... Tell the admin to delete the existing credentials.')
      this.$loading.hide()
      this.$key.val('').show().focus()
      return true
    }

    // Google error: The caller does not have permission.
    // User is not authorized even after providing access.
    // Usually happens when authorizing with a user which doesn't
    // have access to the spreadsheet.
    if (response.code === 403) {
      alertify.error(`You still don't have access to the spreadsheet. Are you using the correct Google account?`, 0)
      console.log(`Did you just deny access on the authorization page? If not you should double check if you're using the Google account with access the the spreadsheet.`)
      this.$loading.hide()
      this.$key.val('').show().focus()
      return true
    }

    return false
  }

  saveSession (name) {
    window.localStorage.name = name
  }

  deleteSession (name) {
    delete window.localStorage.name
  }

  restoreSession () {
    const name = window.localStorage.name
    if (!name) return

    console.log(`- restoring session for ${name}`)
    this.deleteSession(name)
    if (name) this.search(name)
  }

  render (name, response) {
    let result = response.data
    if (result === '(EMPTY)') result = 'JUST AIR, sorry.' // TODO: parameterize this

    this.$loading.hide()
    this.$resultContainer.show()
    this.$resultDisplay.html(result)
    this.$keyRender.html(name)

    // Render image.
    if (response.image) {
      let image = response.image.src
      this.$background.style('background-image', `url('${image}')`)
    }
  }

  setEvents () {
    // name pasted
    bean.on(this.$key.get(), 'paste', (e) => {
      let name = (e.originalEvent || e).clipboardData.getData('text/plain') || window.prompt('Paste here...')
      this.search(name)
    })

    bean.on(this.$key.get(), 'keyup', (e) => {
      if (e.keyCode === 13) {
        const name = this.$key.val()
        this.search(name)
      }
    })

    // close player on esc
    bean.on(document, 'keyup', (e) => {
      if (e.keyCode === 27) {
        this.$loading.hide()
        this.$resultContainer.hide()
        this.$key.val('').show().focus()
      }
    })
  }
}
