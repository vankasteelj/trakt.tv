# TraktApi2
A Trakt.tv API wrapper for their new APIv2 for Node.js.

Using [Q library](http://documentup.com/kriskowal/q/).

## Todo
* Verify functions
* Check required parameters

## Example usage

### Initialize
```
var Trakt = require('traktapi2');
var trakt = new Trakt({
  client_id: '',
  client_secret: '',
  redirect_uri: null // Fallback to urn:ietf:wg:oauth:2.0:oob
});
```

### Generate Auth URL
```
var url = trakt.authUrl();
```

### Verify code/PIN (and optionally state) from returned auth
```
trakt
  .authorizeCode("code/PIN", "csrf token (state)")
  .catch(function(err) { /* Handle error */ })
  .done(function(result) {
    if (result == true) {
      /* API can now be used with authorized requests */
    } else {
      /* Bad code/PIN */
    }
  });
```

### Refresh token
```
trakt
  .refreshToken()
  .catch(function(err) { /* Handle error */ })
  .done(function(result) {
    if (result == true) {
      /* API now has an updated access token */
    } else {
      /* Bad refresh token or expired */
    }
  });
```

### Storing token over sessions
```
var tokenObj = trakt.serializeToken(); // get token
/* Do storage and reloading etc here */
trakt.setAccessToken(tokenObj); // restore token
```

### Actual API requests
See methods in methods.json.

```
trakt
  .calendars.shows.new.start_date.days({
    start_date: "today",
    days: "7",
    extended: "images"
  })
  .catch(function(err) {
    /* Handle any error */
  })
  .done(function(shows) {
    /* shows now contain body response from API (actual show data). */
  });
```

## LICENSE

The MIT License (MIT)

Copyright (c) 2015 Patrick Engström

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
