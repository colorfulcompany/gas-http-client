import GasHttpClient from '../lib/gas_http_client'
import assert        from 'power-assert'

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
})
