import GasHttpClient from '../lib/gas_http_client'
import assert        from 'power-assert'
import sinon         from 'sinon'
import _             from 'lodash/lodash.min'

describe('GasHttpClient', ()=> {
  let client :string
  
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
})
