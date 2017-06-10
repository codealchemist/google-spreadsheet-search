export default class LunchService {
  constructor (name) {
    this.serviceUrl = window.location.origin
    this.promise = null
    this.name = name
    this.successCallback
    this.errorCallback
  }

  get (successCallback, errorCallback) {
    this.successCallback = successCallback
    this.errorCallback = errorCallback

    const url = `${this.serviceUrl}/name/${this.name}`
    this.promise = window.fetch(url, {
      method: 'GET',
      headers: new window.Headers({
        'Content-Type': 'application/json'
      })
    })

    this.promise.then(
      (response) => this.onResponse(response),
      (error) => this.onError(error)
    )
  }

  onResponse (response) {
    return response
      .json()
      .then((data) => {
        this.successCallback(data)
      })
  }

  onError (response) {
    console.log('- error:', response)
    this.errorCallback(response)
  }

  getPromise () {
    return this.promise
  }
}
