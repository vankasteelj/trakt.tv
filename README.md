# trakt.tv
<img src="http://walter.trakt.us/public/favicon.svg" width="100" height="100" />

**Trakt.tv API wrapper for Node.js, featuring:**

- [All Trakt.tv API v2 methods](https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods)
- Promises
- Enhanced protection agains: CSRF ('session riding') and XSS ('content spoofing') attacks, using Crypto and Sanitizer
- Forget JSON, use Objects, Arrays and Strings directly

*For more information about Trakt.tv API, read http://docs.trakt.apiary.io/*

## Example usage

#### Setup

    npm install trakt.tv

#### Initialize
```js
var Trakt = require('trakt.tv');
var trakt = new Trakt({
  client_id: 'the_client_id',
  client_secret: 'the_client_secret',
  redirect_uri: null    // fallbacks to 'urn:ietf:wg:oauth:2.0:oob'
  api_url: null         // fallbacks to 'api-v2launch.trakt.tv'
  debug: false
});
```

#### Generate Auth URL
```js
var url = trakt.get_url();
```

#### Verify code/PIN (and optionally state) from returned auth
```js
trakt.exchange_code('code/PIN', 'csrf token (state)')
    .then(function(result) {
        // contains tokens & session information
        // API can now be used with authorized requests
    })
    .catch(function(err) { 
        // Handles errors 
    });
```

#### Refresh token
```js
trakt.refresh_token()
    .then(function(results) {
        // API now has an updated access token
    })
    .catch(function(err) { 
        // Handles errors 
    });
```

#### Storing token over sessions
```js
var token = trakt.export_token(); // Gets token, store it safely.

trakt.
    import_token(token) // Injects stored token.
    .then(function(shows) {
        // Contains token, refreshed if needed (store it back)
    })
    .catch(function(err) { 
        // Handles errors 
    });
```

#### Actual API requests
See methods in [methods.json](https://github.com/vankasteelj/trakt.tv/blob/master/methods.json).

```js
trakt
    .calendars.all.shows({
        start_date: '2015-11-13',
        days: '7',
        extended: 'images'
    })
    .then(function(shows) {
        // Contains Object{} response from API (show data)
    })
    .catch(function(err) { 
        // Handles errors 
    });
```

#### Notes
- You can use 'me' as username if the user is authenticated.
- Timestamps (such as token _expires_ property) are Epoch in milliseconds.

## LICENSE

The MIT License (MIT)

- Copyright (c) 2015 vankasteelj

- Copyright (c) 2015 Patrick Engström

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
