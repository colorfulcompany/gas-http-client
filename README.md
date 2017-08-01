GasHttpClient
=============

Simple Google Apps Script UrlFetchApp wrapper supporting message authentication with KaleoJWT

feature
=======

 * request()
 * requestJSON()

Usage
=====

```javascript
import GasHttpClient from 'gas-http-client'

let client = new GasHttpClient(UrlFetchApp, 'https://example.com')
client.opts({
  method:  'post',
  payload: {
    thank: 'you',
    very:  'mutch',
    exp:   new Date('2017-07-22').getTime()
  },
  withJWT: {
    'secret':      'abc',
    'headerField': 'X-GAS-JWT',
  }
})

let response = client.requestJSON('/post')
```

Note: `requestJSON()` add header `Accept: application/json` and `Content-Type: application/json` automatically.

You can use `opts()`, `headers()` and `buildParam()` or `buildParamJSON()` for tesing of building HTTP request, without deploying to Google Apps Script to do real HTTP request.

Requirements for bundling this package
======================================

With version 0.2.0, you need to add these dependencies as below, for using this package to downloading from GitHub and building with Babel.

 * babel-plugin-transform-class-properties
 * babel-preset-es2015
 * babel-preset-flow
 * babel-preset-gas
