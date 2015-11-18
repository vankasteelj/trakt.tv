# trakt.tv
A Trakt.tv API wrapper for Node.js.

## Example usage

### Initialize
```
var Trakt = require('trakt.tv');
var trakt = new Trakt({
  client_id: '',
  client_secret: '',
  redirect_uri: null // fallbacks to urn:ietf:wg:oauth:2.0:oob
});
```

### Generate Auth URL
```
var url = trakt.get_url();
```

### Verify code/PIN (and optionally state) from returned auth
```
trakt
  .exchange_code('code/PIN', 'csrf token (state)')
  .then(function(result) {
      /* API can now be used with authorized requests */
  })
  .catch(function(err) { /* Handle error */ });
```

### Refresh token
```
trakt
  .refreshToken()
  .then(function(result) {
    /* API now has an updated access token */
  })
  .catch(function(err) { /* Handle error */ });
```

### Storing token over sessions
```
var token = trakt.export_token(); // get token
/* Do storage and reloading etc here */
trakt.import_token(token); // restore token
```

### Actual API requests
See methods in methods.json.

```
trakt
  .calendars.all.new_shows({
    start_date: 'today',
    days: '7',
    extended: 'images'
  })
  .then(function(shows) {
    /* shows now contain body response from API (actual show data). */
  });
  .catch(function(err) {
    /* Handle any error */
  })
```

### Notes
You can use 'me' as username if the user is authenticated.

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
