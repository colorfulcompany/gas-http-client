// @flow

import _ from 'lodash/lodash.min'
import url from 'url'

class GasHttpClientInvalidOptionKey extends Error {
  constructor(key :string, validKeys :Array<string>) {
    super(`${key} is not valid param. select key from [${validKeys.join(', ')}]`)
  }
}

class GasHttpClientInvalidMethod extends Error {
  constructor(method :string, validMethods :Array<string>) {
    super(`${method} is not valid method, select method from [${validMethods.join(', ')}]`)
  }
}

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app :Object
  /** @var {String} */
  _endpoint :string
  /** @var {Object} */
  _opts :Object
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
   * @return {Array}
   */
  optionKeys() :Array<string> {
    return [
      'contentType',
      'headers',
      'method',
      'payload',
      'validateHttpsCertificates',
      'followRedirects',
      'muteHttpExceptions',
      'escaping'
    ]
  }

  /**
   * @param  {String}
   * @return {Boolean}
   */
  isValidOptionKey(key :string) :boolean {
    return this.optionKeys().indexOf(key) >= 0
  }

  /**
   * @param  {Object}
   * @return {Object}
   */
  opts(opts :mixed = undefined) {
    if ( opts && typeof opts === 'object' ) {
      Object.keys(opts).forEach((e)=> {
        if ( !this.isValidOptionKey(e) ) {
          throw new GasHttpClientInvalidOptionKey(e, this.optionKeys());
        }
      })
      if ( typeof opts['method'] === 'string' ) {
        let method :string = opts['method']
        if ( !this.isValidMethod(method) ) {
          throw new GasHttpClientInvalidMethod(method, this.methods())
        }
      }
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
   * @param  {Object} opts
   * @return {Object}
   */
  buildParam(opts :Object = {}) {
    this._opts = _.merge(this.opts(opts), {headers: this.headers()})

    return this.opts()
  }

  /**
   * @param  {Object} opts
   * @return {Object}
   */
  buildParamForJSON(opts :Object = {}) {
    this.headers({'Accept': 'application/json'})

    if ( (typeof opts['method'] != 'undefined' && opts['method'] != 'get')
      || this.opts()['method'] != 'get' ) {
      this.opts({'contentType': 'application/json'})
    }

    let param = this.buildParam(opts)
    if ( typeof param['payload'] !== 'undefined' && typeof param['payload'] !== 'string' ) {
      param['payload'] = JSON.stringify(param['payload'])
    }

    return param
  }

  /**
   * @param  {mixed}  uri
   * @param  {Object} opts
   * @return {HTTPResponse}
   */
  request(uri :mixed = null, opts :Object = {}) {
    this._response = this.app().fetch(this.buildUrl(uri), this.buildParam(opts))

    return this.response()
  }

  /**
   * @param  {mixed}  uri
   * @param  {Object} opts
   * @return {HTTPResponse}
   */
  requestJSON(uri :mixed = null, opts :Object = {}) {
    this._response = this.app().fetch(this.buildUrl(uri), this.buildParamForJSON(opts))

    return this.response()
  }

  /**
   * @return {Object}
   */
  response() {
    return this._response
  }
}

export { GasHttpClient as default, GasHttpClientInvalidOptionKey, GasHttpClientInvalidMethod }
