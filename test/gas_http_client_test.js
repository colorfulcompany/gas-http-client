/* global describe, it, beforeEach, afterEach */

import assert from 'power-assert'
import sinon from 'sinon'
import gas from 'gas-local'

const app = gas.require('./src', {
  console
})

describe('GasHttpClient', () => {
  let client

  beforeEach(() => {
    client = app.createClient({}, 'http://localhost:3000')
  })

  describe('#app', () => {
    it('return object received with first argument', () => {
      assert.deepEqual({}, client.app())
    })
  })

  describe('#methods', () => {
    it('', () => {
      assert.deepEqual(
        ['get', 'delete', 'patch', 'post', 'put'],
        client.methods())
    })
  })

  describe('#endpoint', () => {
    describe('thru', () => {
      it('', () => {
        assert.equal('http://localhost:3000', client.endpoint())
      })
    })

    describe('stub out', () => {
      beforeEach(() => {
        sinon.stub(client, 'endpoint').returns('http://example.com')
      })
      afterEach(() => { sinon.restore() })
      it('', () => {
        assert.equal('http://example.com', client.endpoint())
      })
    })
  })

  describe('#isValidMethod', () => {
    it('put is valid', () => {
      assert.equal(true, client.isValidMethod('put'))
    })

    it('option is invalid', () => {
      assert.equal(false, client.isValidMethod('option'))
    })

    it('1 is invalid', () => {
      assert.equal(false, client.isValidMethod(1))
    })
  })

  describe('#defaultOpts', () => {
    it('typeof is object', () => {
      assert.equal('object', typeof client.defaultOpts())
    })

    it('size > 0', () => {
      assert.equal(true, Object.keys(client.defaultOpts()).length > 0)
    })
  })

  describe('#isValidOptionKey', () => {
    it('method is isValid', () => {
      assert.equal(true, client.isValidOptionKey('method'))
    })

    it('header is not isValid', () => {
      assert.equal(false, client.isValidOptionKey('header'))
    })
  })

  describe('#opts', () => {
    describe('getter', () => {
      it('', () => {
        assert.deepEqual({ method: 'get' }, client.opts())
      })
    })

    describe('setter', () => {
      describe('valid', () => {
        beforeEach(() => {
          client.opts({ method: 'put' })
        })
        it('', () => {
          assert.deepEqual({ method: 'put' }, client.opts())
        })
      })

      describe('invalid option key', () => {
        it('', () => {
          assert.throws(
            () => {
              client.opts({ methods: 'put' })
            },
            /methods is not valid param/
          )
        })
      })

      describe('invalid method', () => {
        it('', () => {
          assert.throws(
            () => {
              client.opts({ method: 'option' })
            },
            /option is not valid method/
          )
        })
      })

      describe('update headers', () => {
        beforeEach(() => {
          client.opts({
            method: 'put',
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Action'
            }
          })
        })

        it('', () => {
          assert.deepEqual(
            {
              method: 'put',
              headers: {
                Accept: 'application/json',
                'User-Agent': 'Brothers'
              }
            },
            client.opts({
              headers: {
                'User-Agent': 'Brothers'
              }
            })
          )
        })
      })
    })
  })

  describe('#headers', () => {
    describe('getter', () => {
      beforeEach(() => {
        client.clear()
      })

      it('', () => {
        assert.deepEqual({}, client.headers())
      })
    })

    describe('setter', () => {
      describe('once', () => {
        beforeEach(() => {
          client.headers({ 'If-Modified-Since': new Date('2017-07-22') })
        })

        it('', () => {
          assert.deepEqual(
            { 'If-Modified-Since': new Date('2017-07-22') },
            client.headers())
        })
      })

      describe('overwrite', () => {
        beforeEach(() => {
          client.headers({ 'If-Modified-Since': new Date('2017-07-22') })
          client.headers({ 'If-Modified-Since': new Date('2017-07-14') })
        })

        it('', () => {
          assert.deepEqual(
            { 'If-Modified-Since': new Date('2017-07-14') },
            client.headers())
        })
      })

      describe('append', () => {
        beforeEach(() => {
          client.headers({ 'If-Modified-Since': new Date('2017-07-22') })
          client.headers({ 'If-None-Match': 'b6dec5fa1e65ea2b8c7cb9ecc3074e44' })
        })

        it('', () => {
          assert.deepEqual(
            {
              'If-Modified-Since': new Date('2017-07-22'),
              'If-None-Match': 'b6dec5fa1e65ea2b8c7cb9ecc3074e44'
            },
            client.headers())
        })
      })
    })
  })

  describe('#deleteHeader', () => {
    describe('exist', () => {
      beforeEach(() => {
        client.headers({ 'If-Modified-Since': new Date('2017-07-22') })
      })

      it('return deleted object', () => {
        assert.deepEqual(
          { 'If-Modified-Since': new Date('2017-07-22') }
          , client.deleteHeader('If-Modified-Since'))
      })
    })

    describe('not exist', () => {
      it('return false', () => {
        assert.equal(false, client.deleteHeader('If-Modified-Since'))
      })
    })
  })

  describe('#buildUrl', () => {
    // endpoint 'http://localhost:3000'

    it('return endpoint  empty', () => {
      assert.equal('http://localhost:3000', client.buildUrl())
    })

    it('thru when absolute uri given', () => {
      assert.equal('http://example.com/path/to/endpoint?foo=bar', client.buildUrl('http://example.com/path/to/endpoint?foo=bar'))
    })

    it('only path', () => {
      assert.equal('http://localhost:3000/path/to/endpoint', client.buildUrl('/path/to/endpoint'))
    })

    describe('relative path', () => {
      let client

      beforeEach(() => {
        client = app.createClient({}, 'http://localhost:3000/path/to/endpoint')
      })

      it('parent', () => {
        assert.equal('http://localhost:3000/path/', client.buildUrl('..'))
      })
    })

    describe('query string', () => {
      it('foo=bar without ?', () => {
        assert(client.buildUrl('foo=bar') !== 'http://localhost:3000/?foo=bar')
      })

      it('?foo=bar', () => {
        assert('http://localhost:3000/?foo=bar', client.buildUrl('?foo=bar'))
      })
    })

    describe('with object, replace parts', () => {
      // WHATWG URL object doesn't have query property

      it('search is not object', () => {
        assert.throws(
          () => { client.buildUrl({ search: { foo: 'bar' } }) },
          { name: 'TypeError' }
        )
      })

      it('search is string', () => {
        assert.equal('http://localhost:3000/?foo=bar', client.buildUrl({ search: 'foo=bar' }))
      })
    })
  })

  describe('#buildParam', () => {
    beforeEach(() => {
      client.headers({ 'User-Agent': 'Luckyman 2.0' })
    })

    it('', () => {
      assert.deepEqual(
        {
          method: 'get',
          headers: {
            'User-Agent': 'Luckyman 2.0'
          }
        },
        client.buildParam())
    })
  })

  describe('#buildParamForJSON', () => {
    it('method get', () => {
      assert.deepEqual(
        {
          method: 'get',
          headers: {
            Accept: 'application/json'
          }
        },
        client.buildParamForJSON())
    })

    it('method post', () => {
      assert.deepEqual(
        {
          method: 'post',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          },
          payload: JSON.stringify({ hello: 'world' })
        },
        client.buildParamForJSON({
          method: 'post',
          payload: {
            hello: 'world'
          }
        }))
    })

    it('with jwt', () => {
      assert.deepEqual(
        {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify({
            hello: 'world',
            exp: 1500681600000
          }),
          headers: {
            Accept: 'application/json',
            'X-GAS-JWT': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6IndvcmxkIiwiZXhwIjoxNTAwNjgxNjAwMDAwfQ.ieEa6hVDwQW4CrsQEg6o92bvcREiRp81mv1UVZe2Gik'
          }
        },
        client.buildParamForJSON({
          method: 'post',
          payload: {
            hello: 'world',
            exp: new Date('2017-07-22').getTime()
          },
          withJWT: {
            secret: 'abc',
            headerField: 'X-GAS-JWT'
          }
        })
      )
    })
  })

  describe('#request', () => {
    beforeEach(() => {
      sinon.stub(client, 'app').returns({ fetch: function () { return {} } })
    })

    it("request()'s return value is response()", () => {
      assert.deepEqual(client.request(), client.response())
    })
  })
})
