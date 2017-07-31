GasHttpClient
=============

Simple Google Apps Script UrlFetchApp wrapper

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
    very:  'mutch'
  },
  headers: {
    'X-API-Token': 'abc'
  }
})

let response = client.requestJSON('/post')
```

Note: `requestJSON()` add header `Accept: application/json` and `Content-Type: application/json` automatically.

You can use `opts()`, `headers()` and `buildParam()` or `buildParamJSON()` for tesing of building HTTP request, without deploying to Google Apps Script to do real HTTP request.

Requirements for bundling this package
======================================

With version 0.1.0, you need to add these dependencies as below, for using this package to downloading from GitHub and building with Babel.

 * babel-plugin-transform-class-properties
 * babel-preset-es2015
 * babel-preset-flow
 * babel-preset-gas
