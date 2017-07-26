import GasHttpClient from '../lib/gas_http_client'
import assert        from 'power-assert'
import sinon         from 'sinon'
import _             from 'lodash/lodash.min'

describe('GasHttpClient', ()=> {
  let client
  
  beforeEach(()=> {
    client = new GasHttpClient({}, 'http://localhost:3000')
  })

  describe('#app', ()=> {
    it('return object received with first argument', ()=> {
      assert.deepEqual({}, client.app())
    })
  })

  describe('#methods', ()=> {
    it('', ()=> {
      assert.deepEqual(
        ['get', 'delete', 'patch', 'post', 'put'],
        client.methods())
    })
  })

  describe('#endpoint', ()=> {
    describe('thru', ()=> {
      it('', ()=> {
        assert.equal('http://localhost:3000', client.endpoint())
      })
    })

    describe('stub out', ()=> {
      beforeEach(()=> {
        sinon.stub(client, 'endpoint').returns('http://example.com')
      })
      it('', ()=> {
        assert.equal('http://example.com', client.endpoint())
      })
    })
  })

  describe('#isValidMethod', ()=> {
    it('put is valid', ()=> {
      assert.equal(true, client.isValidMethod('put'))
    })

    it('option is invalid', ()=> {
      assert.equal(false, client.isValidMethod('option'))
    })

    it('1 is invalid', ()=> {
      assert.equal(false, client.isValidMethod(1))
    })
  })

  describe('#defaultOpts', ()=> {
    it('typeof is object', ()=> {
      assert.equal('object', typeof client.defaultOpts())
    })

    it('size > 0', ()=> {
      assert.equal(true, _.size(client.defaultOpts()) > 0)
    })
  })

  describe('#opts', ()=> {
    describe('getter', ()=> {
      it('', ()=> {
        assert.deepEqual({method: 'get'}, client.opts())
      })
    })

    describe('setter', ()=> {
      beforeEach(()=> {
        client.opts({method: 'put'})
      })
      it('', ()=> {
        assert.deepEqual({method: 'put'}, client.opts())
      })
    })
  })

  describe('#headers', ()=> {
    describe('getter', ()=> {
      beforeEach(()=> {
        client.clear()
      })

      it('', ()=> {
        assert.deepEqual({}, client.headers())
      })
    })

    describe('setter', ()=> {
      describe('once', ()=> {
        beforeEach(()=> {
          client.headers({'If-Modified-Since': new Date('2017-07-22')})
        })

        it('', ()=> {
          assert.deepEqual(
            {'If-Modified-Since': new Date('2017-07-22')},
            client.headers())
        })
      })

      describe('overwrite', ()=> {
        beforeEach(()=> {
          client.headers({'If-Modified-Since': new Date('2017-07-22')})
          client.headers({'If-Modified-Since': new Date('2017-07-14')})
        })

        it('', ()=> {
          assert.deepEqual(
            {'If-Modified-Since': new Date('2017-07-14')},
            client.headers())
        })
      })

      describe('append', ()=> {
        beforeEach(()=> {
          client.headers({'If-Modified-Since': new Date('2017-07-22')})
          client.headers({'If-None-Match': 'b6dec5fa1e65ea2b8c7cb9ecc3074e44'})
        })

        it('', ()=> {
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

  describe('#deleteHeader', ()=> {
    describe('exist', ()=> {
      beforeEach(()=> {
        client.headers({'If-Modified-Since': new Date('2017-07-22')})
      })

      it('return deleted object', ()=> {
        assert.deepEqual(
          {'If-Modified-Since': new Date('2017-07-22')}
          ,client.deleteHeader('If-Modified-Since'))
      })
    })

    describe('not exist', ()=> {
      it('return false', ()=> {
        assert.equal(false, client.deleteHeader('If-Modified-Since'))
      })
    })
  })

  describe('#buildUrl', ()=> {
    // endpoint 'http://localhost:3000'

    it('return endpoint  empty', ()=> {
      assert.equal('http://localhost:3000', client.buildUrl())
    })

    it('thru when absolute uri given', ()=> {
      assert.equal('http://example.com/path/to/endpoint?foo=bar', client.buildUrl('http://example.com/path/to/endpoint?foo=bar'))
    })

    it('only path', ()=> {
      assert.equal('http://localhost:3000/path/to/endpoint', client.buildUrl('/path/to/endpoint'))
    })

    describe('relative path', ()=> {
      let client

      beforeEach(()=> {
        client = new GasHttpClient({}, 'http://localhost:3000/path/to/endpoint')
      })

      it('parent', ()=> {
        assert.equal('http://localhost:3000/path/', client.buildUrl('..'))
      })
    })

    describe('query string', ()=> {
      it('foo=bar without ?', ()=> {
        assert('http://localhost:3000/?foo=bar' !== client.buildUrl('foo=bar'))
      })

      it('?foo=bar', ()=> {
        assert('http://localhost:3000/?foo=bar', client.buildUrl('?foo=bar'))
      })
    })

    describe('with object, replace parts', ()=> {
      it('query {foo: "bar"}', ()=> {
        assert.equal('http://localhost:3000/?foo=bar', client.buildUrl({query: {foo: 'bar'}}))
      })

      it('search is not object', ()=> {
        assert.throws(()=> {client.buildUrl({search: {foo: 'bar'}})}, TypeError)
      })

      it('search is string', ()=> {
        assert.equal('http://localhost:3000/?foo=bar', client.buildUrl({search: 'foo=bar'}))
      })
    })
  })
})
