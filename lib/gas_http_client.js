// @flow

import _ from 'lodash/lodash.min'

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app :mixed
  /** @var {String} */
  _endpoint :string
  /** @var {Object} */
  _opts :mixed

  /**
   * @param {UrlFetchApp} app
   * @param {String}      endpoint
   * @param {Object}      opts
   */
  constructor(app :mixed, endpoint :string, opts :mixed = undefined) {
    this._app      = app
    this._endpoint = endpoint
    this._opts     = this.defaultOpts()

    this.opts(opts)
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
