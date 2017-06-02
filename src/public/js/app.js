import El from './el.js'
import LunchService from './lunch-service.js'

export default class App {
  constructor () {
    this.$name = new El('name')
    this.$nameContainer = new El('name-container')
    this.$loading = new El('loading')
    this.$lunchContainer = new El('lunch-container')
    this.$lunch = new El('lunch-description')
    this.$nameRender = new El('person-name')
    this.$background = new El('background')
    this.$date = new El('date')

    this.setDate()
    this.setEvents()
    if (this.hasErrors()) {
      this.deleteSession()
      this.displayErrors()
      return
    }

    this.autoloadLunch()
    this.restoreSession()

    // Display name container.
    this.$nameContainer.style('opacity', 1)
  }

  setDate () {
    const date = new Date().toLocaleDateString('en-GB', {
        day : 'numeric',
        weekday: 'short',
        month : 'short',
        year : 'numeric'
    }).split(' ')

    const dayNumber = date[0]
    const dayName = date[1]
    const month = date[2]
    const year = date[3]

    console.log('DATE:', `${month} ${dayNumber} ${dayName}`)
    this.$date
      .html(`${month} ${dayNumber} ${dayName}`)
      .appear()
  }

  getParameterByName (name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  hasErrors () {
    if (location.search.match(/error=/i)) return true
  }

  displayErrors () {
    const errorsMap = {
      'not-authorized': `Sorry, you're not authorized to access the spreadsheet.`
    }

    const errorCode = this.getParameterByName('error', location.href)
    const errorMessage = errorsMap[errorCode] || 'You just broke the Internet :O'
    alertify.error(errorMessage)
  }

  autoloadLunch () {
    if (!location.pathname.match(/[a-z]+/i)) return false

    let url = location.href
    let baseUrl = `${location.origin}/`
    let name = decodeURI(url.replace(baseUrl, '')).trim()

    // load lunch
    this.loadLunch(name)
  }

  loadLunch (name) {
    // prepare ui and play it!
    this.$name.hide()
    this.$loading.show()

    // TODO: query backend and get lunch
    const lunchService = new LunchService(name)
    lunchService.get(
      (response) => {
        if(this.handleErrors(response, name)) return

        console.log('--- GOT LUNCH:', response)
        this.renderLunch(name, response)
      },

      // Connection error.
      (error) => {
        alertify.error('Oops... Something broke at the kitchen.', 0)
        this.$loading.hide()
        this.$name.val('').show().focus()
      }
    )
  }

  handleErrors (response, name) {
    // Open authorization page if required.
    // This happens when there are no credentials stored.
    if (response.status === 'not-authorized') {
      alertify.success('Redirecting to authorization page...')
      console.log('Hey! After authorizing the app you should be taken back to Lunch Notifier and your lunch should load automatically ;)')
      this.saveSession(name)
      location.href = response.url
      return true
    }

    // Invalid request.
    // Usually happens when the credentials are wrong.
    if (response.code === 400) {
      alertify.error('Oops... Something broke at the kitchen.', 0)
      console.log('Psss... Tell the admin to delete the existing credentials.')
      this.$loading.hide()
      this.$name.val('').show().focus()
      return true
    }

    // Google error: The caller does not have permission.
    // User is not authorized even after providing access.
    // Usually happens when authorizing with a user which doesn't
    // have access to the spreadsheet.
    if (response.code === 403) {
      alertify.error(`You still don't have access to the spreadsheet. Are you using the correct Google account?`, 0)
      console.log(`Did you just deny access on the authorization page? If not you should double check if you're using your Elementum account, which is the one with access the the lunch spreadsheet.`)
      this.$loading.hide()
      this.$name.val('').show().focus()
      return true
    }

    return false
  }

  saveSession (name) {
    localStorage.name = name
  }

  deleteSession (name) {
    delete localStorage.name
  }

  restoreSession () {
    const name = localStorage.name
    if (!name) return

    console.log(`- restoring session for ${name}`)
    this.deleteSession(name)
    if (name) this.loadLunch(name)
  }

  renderLunch (name, data) {
    let lunch = data.lunch
    if (lunch === '(EMPTY)') lunch = 'JUST AIR, sorry.'

    this.$loading.hide()
    this.$lunchContainer.show()
    this.$lunch.html(lunch)
    this.$nameRender.html(name)

    // Render image.
    if (data.image) {
      let image = data.image.src
      this.$background.style('background-image', `url('${image}')`)
    }
  }

  setEvents () {
    // name pasted
    bean.on(this.$name.get(), 'paste', (e) => {
      let name = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste here...')
      this.loadLunch(name)
    })

    bean.on(this.$name.get(), 'keyup', (e) => {
      if (e.keyCode === 13) {
        const name = this.$name.val()
        this.loadLunch(name)
      }
    })

    // close player on esc
    bean.on(document, 'keyup', (e) => {
      if (e.keyCode === 27) {
        this.$loading.hide()
        this.$lunchContainer.hide()
        this.$name.val('').show().focus()
      }
    })
  }
}
