GasHttpClient
=============

Simple Google Apps Script UrlFetchApp wrapper supporting message authentication with KaleoJWT

[KaleoSoftware/KaleoJWT: Super simple, portable JWT implementation that supports only SHA256 algo](https://github.com/KaleoSoftware/KaleoJWT)

feature
=======

 * request()
 * requestJSON()

Usage
=====

Prepare
-------

 1. clone this repo
 2. clasp init & clasp push
 3. deploy this as Library and memo Library ID from Project settings
 4. add Library with memoed ID from Script Editor

create Reader from Apps Script Project
--------------------------------------

```javascript
const client = GasHttpClient.createClient(UrlFetchApp, 'https://example.com')
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

const response = client.requestJSON('/post')
```

Note: `requestJSON()` add header `Accept: application/json` and `Content-Type: application/json` automatically.

You can use `opts()`, `headers()` and `buildParam()` or `buildParamJSON()` for tesing of building HTTP request, without deploying to Google Apps Script to do real HTTP request.
