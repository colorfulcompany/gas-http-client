// @flow

import _ from 'lodash/lodash.min'

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app :mixed
  /** @var {String} */
  _endpoint :string
  /** @var {Object} */
  _opts :mixed
  /** @var {Object} */
  _headers :mixed = {}

  /**
   * @param {UrlFetchApp} app
   * @param {String}      endpoint
   * @param {Object}      opts
   */
  constructor(app :mixed, endpoint :string, opts :mixed = undefined) {
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
}

export { GasHttpClient as default }
