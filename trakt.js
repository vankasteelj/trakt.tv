(function(exports) {
    'use strict';

    var got = require('got'),
        crypto = require('crypto'),
        reqs = require('./methods.json'),
        sanitizer = require('sanitizer'),
        Url = 'https://api-v2launch.trakt.tv',
        Urn = 'urn:ietf:wg:oauth:2.0:oob';

    var Trakt = function(settings, debug) {
        if (!settings.client_id || !settings.client_secret) {
            throw new Error('Missing client credentials');
        }

        this._authentication = {};
        this._settings = {
            client_id: settings.client_id,
            client_secret: settings.client_secret,
            redirect_uri: settings.redirect_uri ? settings.redirect_uri : Urn,
            debug: debug === true ? true : false,
            endpoint: debug && settings.api_url ? settings.api_url : Url
        };

        this._construct();
    };

    /**
     * Internal Functions
     */

    // Creates methods for all requests
    Trakt.prototype._construct = function() {
        var that = this;
        for (var url in reqs) {
            var urlParts = url.split('/');
            var name = urlParts.pop(); // key for function

            var tmp = that;
            for (var p = 1; p < urlParts.length; ++p) { // acts like mkdir -p
                tmp = tmp[urlParts[p]] || (tmp[urlParts[p]] = {});
            }

            tmp[name] = function() {
                var method = reqs[url]; // closure forces copy
                return function(params, callback) {
                    return that._apiCall(method, params, callback);
                };
            }();
        }
    };

    // Debug & Print
    Trakt.prototype._printRequest = function(req) {
        if (!this._settings.debug) return;
        console.log(req.method + (req.headers['Authorization'] ? ' (oauth)' : '') + ': ' + req.url);
    };

    // Authentication calls
    Trakt.prototype._authRequest = function(req) {
        var that = this;
        this._printRequest(req);
        return got(req.url, req)
            .then(function(response) {
                var body = JSON.parse(response.body);
                that._authentication.refresh_token = body.refresh_token;
                that._authentication.access_token = body.access_token;
                that._authentication.expires = Date.now() + body.expires_in;
                return that.sanitize(body);
            })
            .catch(function(error) {
                if (error.response.statusCode == 401) {
                    throw new Error(error.response.headers['www-authenticate']);
                } else {
                    throw error;
                }
            });
    };

    // Parse url before api call
    Trakt.prototype._parseUrl = function(method, params) {
        if (!params) params = {};
        var queryParts = [],
            pathParts = [];

        // Pagination
        if (method.opts['pagination'] && params['page']) {
            queryParts.push('page=' + params['page']);
            if (params['limit']) queryParts.push('limit=' + params['limit']);
        }

        // Extended
        if (params['extended']) queryParts.push('extended=' + params['extended']);

        // ?Part
        var queryPart = method.url.split('?')[1];
        if (queryPart) {
            var queryParams = queryPart.split('&');
            for (var i in queryParams) {
                var name = queryParams[i].split('=')[0];
                if (params[name]) queryParts.push(name + '=' + params[name]);
            }
        }

        // /part
        var pathPart = method.url.split('?')[0];
        var pathParams = pathPart.split('/');
        for (var k in pathParams) {
            if (pathParams[k][0] != ':') {
                pathParts.push(pathParams[k]);
            } else {
                var param = params[pathParams[k].substr(1)];
                if (param) pathParts.push(param);
            }
        }

        var url = this._settings.endpoint + pathParts.join('/');
        if (queryParts.length) url += '?' + queryParts.join('&');
        return url;
    };

    // Parse methods then hit trakt
    Trakt.prototype._apiCall = function(method, params) {
        if (method.opts['auth'] === true && !this._authentication.access_token) {
            throw new Error('Auth required');
        }
        var that = this;

        var req = {
            method: method.method,
            url: this._parseUrl(method, params),
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': this._settings.client_id
            },
            body: (method.body ? method.body : {})
        };

        if (method.opts['auth']) {
            req.headers['Authorization'] = 'Bearer ' + this._authentication.access_token;
        }

        for (var k in params) {
            if (k in req.body) {
                req.body[k] = params[k];
            }
        }
        for (var k in req.body) {
            if (!req.body[k]) {
                delete req.body[k];
            }
        }

        req.body = JSON.stringify(req.body);

        this._printRequest(req);
        return got(req.url, req).then(function(response) {
            return that.sanitize(JSON.parse(response.body));
        });
    };

    // Sanitize output (xss)
    Trakt.prototype.sanitize = function (input) {
        function sanitizeString(string) {
            return sanitizer.sanitize(string);
        }

        function sanitizeObject(obj) {
            var result = obj;
            for (var prop in obj) {
                result[prop] = obj[prop];
                if (obj[prop] && (obj[prop].constructor === Object || obj[prop].constructor === Array)) {
                    result[prop] = sanitizeObject(obj[prop]);
                } else if (obj[prop] && obj[prop].constructor === String) {
                    result[prop] = sanitizeString(obj[prop]);
                }
            }
            return result;
        }

        var output = input;
        if (input && (input.constructor === Object || input.constructor === Array)) {
            output = sanitizeObject(input);
        } else if (input && input.constructor === String) {
            output = sanitizeString(input);
        }

        return output;
    };

    /**
     * External functions
     */

    // Get authentication url for browsers
    Trakt.prototype.authUrl = function() {
        this._authentication.state = crypto.randomBytes(6).toString('hex');
        return 'https://trakt.tv/oauth/authorize?response_type=code&client_id=' + this._client_id + '&redirect_uri=' + this._settings.redirect_uri + '&state=' + this._authentication.state;
    };

    // Verify code or pin
    Trakt.prototype.authorizeCode = function(code, state) {
        if (state && state != this._authentication.state) {
            throw new Error('Invalid CSRF (State)');
        }

        return this._authRequest({
            method: 'POST',
            url: this._settings.endpoint + '/oauth/token',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                client_id: this._settings.client_id,
                client_secret: this._settings.client_secret,
                redirect_uri: this._settings.redirect_uri,
                grant_type: 'authorization_code'
            })
        });
    };

    // Refresh access token
    Trakt.prototype.refreshToken = function() {
        return this._authRequest({
            method: 'POST',
            url: this._settings.endpoint + '/oauth/token',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh_token: this._authentication.refresh_token,
                client_id: this._settings.client_id,
                client_secret: this._settings.client_secret,
                redirect_uri: this._settings.redirect_uri,
                grant_type: 'authorization_code'
            })
        });
    };

    // Import token
    Trakt.prototype.setAccessToken = function(token) {
        this._authentication.access_token = token.access_token;
        this._authentication.expires = token.expires;
        this._authentication.refresh_token = token.refresh_token;
    };

    // Export token
    Trakt.prototype.serializeToken = function() {
        return {
            access_token: this._authentication.access_token,
            expires: this._authentication.expires,
            refresh_token: this._authentication.refresh_token
        };
    };

    module.exports = Trakt;
}());