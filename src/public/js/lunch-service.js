export default class LunchService {
  constructor (name) {
    this.serviceUrl = 'http://10.2.1.69:9200'
    this.promise = null
    this.name = name
    this.successCallback
    this.errorCallback
  }

  get (successCallback, errorCallback) {
    this.successCallback = successCallback
    this.errorCallback = successCallback

    const url = `${this.serviceUrl}/name/${this.name}`
    this.promise = fetch(url, {
      method: 'GET',
      headers: new Headers({
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