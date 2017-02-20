import El from './el.js'
import LunchService from './lunch-service.js'

export default class App {
  constructor () {
    this.$name = new El('name')
    this.$loading = new El('loading')
    this.$lunchContainer = new El('lunch-container')
    this.$lunch = new El('lunch-description')
    this.$nameRender = new El('person-name')

    this.setDefaults()
    this.setEvents()
    this.autoloadLunch()
  }

  setDefaults () {
    // alertify.defaults.glossary.title = 'Lunch Notifier' // default alert title
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
        console.log('--- GOT LUNCH:', response)
        this.renderLunch(name, response)
      },
      (error) => {
        alertify.error('Oops... Something broke at the kitchen.')

        this.$loading.hide()
        this.$name.val('').show().focus()
      },
    )
  }

  renderLunch (name, data) {
    let lunch = data.lunch
    if (lunch === '(EMPTY)') lunch = 'JUST AIR, sorry.'

    this.$loading.hide()
    this.$lunchContainer.show()
    this.$lunch.html(lunch)
    this.$nameRender.html(name)
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