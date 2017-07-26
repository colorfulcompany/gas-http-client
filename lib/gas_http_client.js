// @flow

import _ from 'lodash/lodash.min'
import url from 'url'

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app :Object
  /** @var {String} */
  _endpoint :string
  /** @var {Object} */
  _opts :mixed
  /** @var {Object} */
  _headers :Object = {}
  /** @var {Object} */
  _response :Object = {}

  /**
   * @param {UrlFetchApp} app
   * @param {String}      endpoint
   * @param {Object}      opts
   */
  constructor(app :Object, endpoint :string, opts :mixed = undefined) {
    this._app      = app
    this._endpoint = endpoint
    this.clear()

    this.opts(opts)
  }

  clear() {
    this._opts    = this.defaultOpts()
    this._headers = {}
  }

  /**
   * @return {Object}
   */
  app() {
    return this._app
  }

  /**
   * @return {String}
   */
  endpoint() {
    return this._endpoint
  }

  /**
   * @return {Object}
   */
  defaultOpts() {
    return {
      method: 'get'
    }
  }

  /**
   * @param  {Object}
   * @return {Object}
   */
  opts(opts :mixed = undefined) {
    if ( typeof opts !== 'undefined' ) {
      this._opts = _.merge(this._opts, opts)
    }

    return this._opts
  }

  /**
   * @param  {Object}
   * @return {Object}
   */
  headers(headers :mixed = undefined) {
    if ( typeof headers !== 'undefined' ) {
      this._headers = _.merge(this._headers, headers)
    }

    return this._headers
  }

  /**
   * @param  {String} field
   * @return {mixed}  Object or false
   */
  deleteHeader(field :string) :mixed {
    if ( _.has(this._headers, field) ) {
      let item = {}
      item[field] = this._headers[field]

      if ( delete this._headers[field] ) {
        return item
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * @return {Array}
   */
  methods() :Array<string> {
    return ['get', 'delete', 'patch', 'post', 'put']
  }

  /**
   * @return {Boolean}
   */
  isValidMethod(method :string) :boolean {
    return this.methods().indexOf(method) >= 0
  }

  /**
   * @param  {String} uri
   * @return {String}
   */
  buildUrl(uri :mixed = null) {
    if ( typeof uri === 'string' && uri.length > 0 ) {
      return url.resolve(this.endpoint(), uri)
    } else if ( uri !== null && typeof uri === 'object' ) {
      return url.format(_.merge(url.parse(this.endpoint(), true), uri))
    } else {
      return this.endpoint()
    }
  }

  /**
   * @param  {mixed}  uri
   * @param  {Object} opts
   * @return {HTTPResponse}
   */
  request(uri :mixed = null, opts :Object = {}) {
    this._response = this.app().fetch(this.buildUrl(uri), this.opts(opts))

    return this.response()
  }

  /**
   * @return {Object}
   */
  response() {
    return this._response
  }
}

export { GasHttpClient as default }
