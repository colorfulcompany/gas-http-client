/* global merge, cloneDeep, has, URL, jwt */

class GasHttpClientInvalidOptionKey extends Error {
  constructor (key, validKeys) {
    super(`${key} is not valid param. select key from [${validKeys.join(', ')}]`)
  }

  get name () { return 'GasHttpClientInvalidOptionKey' }
}

class GasHttpClientInvalidMethod extends Error {
  constructor (method, validMethods) {
    super(`${method} is not valid method, select method from [${validMethods.join(', ')}]`)
  }

  get name () { return 'GasHttpClientInvalidMethod' }
}

class GasHttpClientNoJwtSecret extends Error {
  get name () { return 'GasHttpClientNoJwtSecret' }
}

class GasHttpClient {
  /** @var {UrlFetchApp} */
  _app
  /** @var {String} */
  _endpoint
  /** @var {Object} */
  _url
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
    this._url = new URL(endpoint)
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
  url () {
    return this._url
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
      this._opts = merge(this._opts, opts)
    }

    return this._opts
  }

  /**
   * @param  {Object} parts
   * @return {Object}
   */
  jwtOpts (opts = {}) {
    if (Object.keys(opts).length > 0) {
      this._jwtOpts = merge(this._jwtOpts, opts)
    }

    return this._jwtOpts
  }

  /**
   * @param  {Object}
   * @return {Object}
   */
  headers (headers = undefined) {
    if (typeof headers !== 'undefined') {
      this._headers = merge(this._headers, headers)
    }

    return this._headers
  }

  /**
   * @param  {String} field
   * @return {mixed}  Object or false
   */
  deleteHeader (field) {
    if (has(this._headers, field)) {
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
    const url = (() => {
    if (typeof uri === 'string' && uri.length > 0) {
      return new URL(uri, this.endpoint())
    } else if (uri !== null && typeof uri === 'object') {
      const u = this.url()

      for (const [key, value] of Object.entries(uri)) {
        if (key === 'search' && typeof value !== 'string') {
          throw new TypeError(`search property is string, but given ${JSON.stringify(value)}`)
        }

        u[key] = value
      }

      return u
    } else {
      return this.endpoint()
    }
    })()

    this._url = url

    return url.toString()
  }

  /**
   * @param  {Object} opts
   * @return {Object}
   */
  buildParam (opts = {}) {
    return merge(this.opts(opts), { headers: this.headers() })
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

    const param = cloneDeep(this.buildParam(opts))
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
    const opts = cloneDeep(this.jwtOpts())

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

/**
 * @param {UrlFetchApp} app
 * @param {String} endpoint
 * @param {Object} [opts]
 * @return {GasHttpClient}
 */
function createClient (app, endpoint, opts = undefined) { // eslint-disable-line no-unused-vars
  return new GasHttpClient(app, endpoint, opts)
}
