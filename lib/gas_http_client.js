// @flow

import _ from 'lodash/lodash.min'

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app :mixed
  /** @var {String} */
  _endpoint :string

  /**
   * @param {UrlFetchApp} app
   * @param {String}      endpoint
   * @param {Object}      opts
   */
  constructor(app :mixed, endpoint :string, opts :mixed = {}) {
    this._app      = app
    this._endpoint = endpoint
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
