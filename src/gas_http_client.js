//

import _ from 'lodash/lodash.min'
import url from 'url'
import jwt from 'kaleoJWT/dist/KaleoJWT.min'

class GasHttpClientInvalidOptionKey extends Error {
  constructor (key, validKeys) {
    super(`${key} is not valid param. select key from [${validKeys.join(', ')}]`)
  }
}

class GasHttpClientInvalidMethod extends Error {
  constructor (method, validMethods) {
    super(`${method} is not valid method, select method from [${validMethods.join(', ')}]`)
  }
}

class GasHttpClientNoJwtSecret extends Error {}

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app
  /** @var {String} */
  _endpoint
  /** @var {Object} */
  _opts
  /** @var {Object} */
  _headers = {}
  /** @var {Object} */
  _response = {}
  /** @var {Object} */
  _jwtOpts = {}

  /**
   * @param {UrlFetchApp} app
   * @param {String}      endpoint
   * @param {Object}      opts
   */
  constructor (app, endpoint, opts = undefined) {
    this._app = app
    this._endpoint = endpoint
    this.clear()

    this.opts(opts)
  }

  clear () {
    this._opts = this.defaultOpts()
    this._headers = {}
  }

  /**
   * @return {Object}
   */
  app () {
    return this._app
  }

  /**
   * @return {String}
   */
  endpoint () {
    return this._endpoint
  }

  /**
   * @return {Object}
   */
  defaultOpts () {
    return {
      method: 'get'
    }
  }

  /**
   * @return {Array}
   */
  optionKeys () {
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
  isValidOptionKey (key) {
    return this.optionKeys().indexOf(key) >= 0
  }

  /**
   * @param  {Object}
   * @return {Object}
   */
  opts (opts = undefined) {
    if (opts && typeof opts === 'object') {
      // store headers
      if (opts.headers && typeof opts.headers !== 'object') {
        this.headers(opts.headers)
        delete (opts.headers)
      }
      // store JWT options
      if (opts.withJWT && typeof opts.withJWT === 'object') {
        const jwt = opts.withJWT
        delete opts.withJWT
        this.jwtOpts(jwt)
      }
      // validate Option Key
      Object.keys(opts).forEach((e) => {
        if (!this.isValidOptionKey(e)) {
          throw new GasHttpClientInvalidOptionKey(e, this.optionKeys())
        }
      })
      // validate HTTP Method
      if (typeof opts.method === 'string') {
        const method = opts.method
        if (!this.isValidMethod(method)) {
          throw new GasHttpClientInvalidMethod(method, this.methods())
        }
      }
      this._opts = _.merge(this._opts, opts)
    }

    return this._opts
  }

  /**
   * @param  {Object} parts
   * @return {Object}
   */
  jwtOpts (opts = {}) {
    if (Object.keys(opts).length > 0) {
      this._jwtOpts = _.merge(this._jwtOpts, opts)
    }

    return this._jwtOpts
  }

  /**
   * @param  {Object}
   * @return {Object}
   */
  headers (headers = undefined) {
    if (typeof headers !== 'undefined') {
      this._headers = _.merge(this._headers, headers)
    }

    return this._headers
  }

  /**
   * @param  {String} field
   * @return {mixed}  Object or false
   */
  deleteHeader (field) {
    if (_.has(this._headers, field)) {
      const item = {}
      item[field] = this._headers[field]

      if (delete this._headers[field]) {
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
  methods () {
    return ['get', 'delete', 'patch', 'post', 'put']
  }

  /**
   * @return {Boolean}
   */
  isValidMethod (method) {
    return this.methods().indexOf(method) >= 0
  }

  /**
   * @param  {String} uri
   * @return {String}
   */
  buildUrl (uri = null) {
    if (typeof uri === 'string' && uri.length > 0) {
      return url.resolve(this.endpoint(), uri)
    } else if (uri !== null && typeof uri === 'object') {
      return url.format(_.merge(url.parse(this.endpoint(), true), uri))
    } else {
      return this.endpoint()
    }
  }

  /**
   * @param  {Object} opts
   * @return {Object}
   */
  buildParam (opts = {}) {
    return _.merge(this.opts(opts), { headers: this.headers() })
  }

  /**
   * @param  {Object} opts
   * @return {Object}
   */
  buildParamForJSON (opts = {}) {
    this.headers({ Accept: 'application/json' })

    if ((typeof opts.method !== 'undefined' && opts.method !== 'get') ||
      this.opts().method !== 'get') {
      this.opts({ contentType: 'application/json' })
    }

    const param = _.cloneDeep(this.buildParam(opts))
    // encode payload
    if (typeof param.payload !== 'undefined' && typeof param.payload !== 'string') {
      param.payload = JSON.stringify(param.payload)
    }

    // generate jwt
    if (typeof this.opts().payload !== 'undefined' &&
         typeof this.opts().payload === 'object' &&
         typeof this.jwtOpts().secret === 'string') {
      const jwt = this.buildJwt(this.opts().payload)
      if (jwt) {
        const [field, token] = jwt
        param.headers[field] = token
      }
    }

    return param
  }

  /**
   * call after setting opts
   *
   * @param  {Object} payload
   * @return {mixed}
   */
  buildJwt (payload) {
    let token
    let secret
    let headerField
    const opts = _.cloneDeep(this.jwtOpts())

    if (typeof opts.headerField === 'string') {
      headerField = opts.headerField
      delete opts.headerField
    }

    if (typeof opts.secret === 'string' && opts.secret.length > 0) {
      secret = opts.secret
      delete opts.secret

      token = jwt.sign(payload, secret)
    } else {
      throw new GasHttpClientNoJwtSecret('no jwt secret specified')
    }

    return (headerField && token) ? [headerField, token] : false
  }

  /**
   * @param  {mixed}  uri
   * @param  {Object} opts
   * @return {HTTPResponse}
   */
  request (uri = null, opts = {}) {
    this._response = this.app().fetch(this.buildUrl(uri), this.buildParam(opts))

    return this.response()
  }

  /**
   * @param  {mixed}  uri
   * @param  {Object} opts
   * @return {HTTPResponse}
   */
  requestJSON (uri = null, opts = {}) {
    this._response = this.app().fetch(this.buildUrl(uri), this.buildParamForJSON(opts))

    return this.response()
  }

  /**
   * @return {Object}
   */
  response () {
    return this._response
  }
}

export { GasHttpClient as default, GasHttpClientInvalidOptionKey, GasHttpClientInvalidMethod, GasHttpClientNoJwtSecret }
