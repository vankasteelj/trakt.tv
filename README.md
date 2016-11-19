# trakt.tv
<img src="https://trakt.tv/assets/logos/header@2x-56e5ba415108fa367fd64e5b5df9d0c5.png" width="100" height="100" />

**Trakt.tv API wrapper for Node.js, featuring:**

- [All Trakt.tv API v2 methods](https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods)
- Promises
- Forget JSON, use Objects, Arrays and Strings directly
- Enhanced protection against: CSRF (session riding) and XSS (content spoofing) attacks, using Crypto and Sanitizer
- [Plugin extension](https://github.com/vankasteelj/trakt.tv/wiki/Available-plugins)

*For more information about Trakt.tv API, read http://docs.trakt.apiary.io/*

## Example usage

#### Setup

    npm install trakt.tv --save

#### Initialize
```js
import Trakt from 'trakt.tv';

const trakt = new Trakt({
  client_id: 'the_client_id',
  client_secret: 'the_client_secret',
  redirect_uri: null    // fallbacks to 'urn:ietf:wg:oauth:2.0:oob'
  api_url: null         // fallbacks to 'api-v2launch.trakt.tv'
});
```

#### Generate Auth URL
```js
const url = trakt.get_url();
```

#### Verify code (and optionally state) from returned auth
```js
trakt.exchange_code('code', 'csrf token (state)')
    .then(result => {
        // contains tokens & session information
        // API can now be used with authorized requests
    })
    .catch(err => {
        // Handles errors 
    });
```

#### Alternate OAUTH "device" method
```js
trakt.get_codes()
    .then(poll => {
        // Poll contains 'verification_url' you need to visit
        // and the 'user_code' you need to use on that url
        
        return trakt.poll_access(poll);
        // this second call is required to verify if app was authorized
    })
    .catch(error {
        // Handles errors
        // specific error.message == 'Expired' will be thrown
        // in case the verification_url was not used in time
    });
```

#### Refresh token
```js
trakt.refresh_token()
    .then(results => {
        // API now has an updated access token
    })
    .catch(err => {
        // Handles errors 
    });
```

#### Storing token over sessions
```js
const token = trakt.export_token(); // Gets token, store it safely.

trakt.import_token(token) // Injects stored token.
    .then(newTokens => {
        // Contains token, refreshed if needed (store it back)
    })
    .catch(err => {
        // Handles errors 
    });
```

#### Actual API requests
See methods in [methods.json](https://github.com/vankasteelj/trakt.tv/blob/master/methods.json) or [wiki](https://github.com/vankasteelj/trakt.tv/wiki/Supported-methods).

```js
trakt.calendars.all.shows({
        start_date: '2015-11-13',
        days: '7',
        extended: 'full'
    })
    .then(shows => {
        // Contains Object{} response from API (show data)
    })
    .catch(err => {
        // Handles errors 
    });
```

```js
trakt.search.text({
        query: 'tron',
        type: 'movie,person'
    })
    .then(response => {
        // Contains Array[] response from API (search data)
    })
    .catch(err => { 
        // Handles errors 
    });
```

```js
trakt.search.id({
        id_type: 'imdb',
        id: 'tt0084827'
    })
    .then(response => {
        // Contains Array[] response from API (imdb data)
    })
    .catch(err => { 
        // Handles errors 
    });
```

#### Using pagination
You can extend your calls with `pagination: true` to get the extra pagination info from headers.

```js
trakt.movies.popular({
        pagination: true
    })
    .then(movies => {
        /**
        movies = Object {
            data: [<actual data from API>],
            pagination: {
                item-count: "80349",
                limit: "10",
                page: "1",
                page-count: "8035"
            }
        }
        **/
    })
    .catch(err => {
        // Handles errors 
    });
```

Note: _this will contain `data` and `pagination` for all calls, even if no pagination is available. it's typically for really advanced use only_

#### Load plugins
When calling `new Trakt()`, include desired plugins (must be installed from npm):

```js
const trakt = new Trakt({
    client_id: '',
    client_secret: '',
    plugins: ['ondeck'] // 'ondeck' refers to npm 'trakt.tv-ondeck' plugin
});
```

#### Write plugins
See the [wiki page](https://github.com/vankasteelj/trakt.tv/wiki/Write-plugins-for-trakt.tv).

#### Notes
- You can use 'me' as username if the user is authenticated.
- Timestamps (such as token _expires_ property) are Epoch in milliseconds.

## LICENSE

The MIT License (MIT)

- Copyright (c) 2015-2016 vankasteelj

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
