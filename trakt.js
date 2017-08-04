'use strict';

// default settings
const defaultUrl = 'https://api.trakt.tv';
const redirectUrn = 'urn:ietf:wg:oauth:2.0:oob';

// requirejs modules
const got = require('got');
const crypto = require('crypto');
const methods = require('./methods.json');
const sanitizer = require('sanitizer').sanitize;

module.exports = class Trakt {
    constructor(settings = {}, debug) {
        if (!settings.client_id) throw Error('Missing client_id');

        this._authentication = {};
        this._settings = {
            client_id: settings.client_id,
            client_secret: settings.client_secret,
            redirect_uri: settings.redirect_uri || redirectUrn,
            debug: settings.debug || debug,
            endpoint: settings.api_url || defaultUrl,
            useElectronNet: !!settings.useElectronNet,
        };

        this._construct();

        settings.plugins && this._plugins(settings.plugins, settings.options);
    }

    // Creates methods for all requests
    _construct() {
        for (let url in methods) {
            const urlParts = url.split('/');
            const name = urlParts.pop(); // key for function

            let tmp = this;
            for (let p = 1; p < urlParts.length; ++p) { // acts like mkdir -p
                tmp = tmp[urlParts[p]] || (tmp[urlParts[p]] = {});
            }

            tmp[name] = (() => {
                const method = methods[url]; // closure forces copy
                return (params) => {
                    return this._call(method, params);
                };
            })();
        }
    }

    // Initialize plugins
    _plugins(plugins, options = {}) {
        for (let name in plugins) {
            if (!plugins.hasOwnProperty(name)) continue;

            this[name] = plugins[name];
            this[name].init(this, (options[name] || {}));
            this._debug('Trakt.tv ' + name + ' plugin loaded');
        }
    }

    // Debug & Print
    _debug(req) {
        this._settings.debug && console.log(req.method ? req.method + (req.headers['Authorization'] ? ' (oauth)' : '') + ': ' + req.url : req);
    }

    // Authentication calls
    _exchange(str) {
        const req = {
            method: 'POST',
            url: this._settings.endpoint + '/oauth/token',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(str),
            useElectronNet: this._settings.useElectronNet,
        };

        this._debug(req);
        return got(req.url, req).then(response => {
            const body = JSON.parse(response.body);

            this._authentication.refresh_token = body.refresh_token;
            this._authentication.access_token = body.access_token;
            this._authentication.expires = (body.created_at + body.expires_in) * 1000;

            return this._sanitize(body);
        }).catch(error => {
            throw (error.response && error.response.statusCode == 401) ? Error(error.response.headers['www-authenticate']) : error;
        });
    }

    // De-authentication POST
    _revoke() {
        const req = {
            method: 'POST',
            url: this._settings.endpoint + '/oauth/revoke',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization' : 'Bearer ' + this._authentication.access_token,
                'trakt-api-version': '2',
                'trakt-api-key': this._settings.client_id
            },
            body: 'token=[' + this._authentication.access_token + ']',
            useElectronNet: this._settings.useElectronNet,
        };
        this._debug(req);
        got(req.url, req);
    }

    // Get code to paste on login screen
    _device_code(str, type) {
        const req = {
            method: 'POST',
            url: this._settings.endpoint + '/oauth/device/' + type,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(str),
            useElectronNet: this._settings.useElectronNet,
        };

        this._debug(req);
        return got(req.url, req).then(response => this._sanitize(JSON.parse(response.body))).catch(error => {
            throw (error.response && error.response.statusCode == 401) ? Error(error.response.headers['www-authenticate']) : error;
        });
    }

    // Parse url before api call
    _parse(method, params) {
        if (!params) params = {};

        const queryParts = [];
        const pathParts = [];

        // ?Part
        const queryPart = method.url.split('?')[1];
        if (queryPart) {
            const queryParams = queryPart.split('&');
            for (let i in queryParams) {
                const name = queryParams[i].split('=')[0];
                (params[name] || params[name] === 0) && queryParts.push(name + '=' + params[name]);
            }
        }

        // /part
        const pathPart = method.url.split('?')[0];
        const pathParams = pathPart.split('/');
        for (let k in pathParams) {
            if (pathParams[k][0] != ':') {
                pathParts.push(pathParams[k]);
            } else {
                const param = params[pathParams[k].substr(1)];
                if (param || param === 0) {
                    pathParts.push(param);
                } else {
                    // check for missing required params
                    if (method.optional && method.optional.indexOf(pathParams[k].substr(1)) === -1) throw Error('Missing mandatory paramater: ' + pathParams[k].substr(1));
                }
            }
        }

        // Filters
        const filters = ['query', 'years', 'genres', 'languages', 'countries', 'runtimes', 'ratings', 'certifications', 'networks', 'status'];
        for (let p in params) {
            filters.indexOf(p) !== -1 && queryParts.indexOf(p+'=' + params[p]) === -1 && queryParts.push(p+'=' + params[p]);
        }

        // Pagination
        if (method.opts['pagination']) {
            params['page'] && queryParts.push('page=' + params['page']);
            params['limit'] && queryParts.push('limit=' + params['limit']);
        }

        // Extended
        params['extended'] && queryParts.push('extended=' + params['extended']);

        let url = this._settings.endpoint + pathParts.join('/');
        if (queryParts.length) url += '?' + queryParts.join('&');
        return url;
    }

    // Parse methods then hit trakt
    _call(method, params) {
        if (method.opts['auth'] === true && (!this._authentication.access_token || !this._settings.client_secret)) throw Error('OAuth required');

        const req = {
            method: method.method,
            url: this._parse(method, params),
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': this._settings.client_id
            },
            body: (method.body ? Object.assign({}, method.body) : {}),
            useElectronNet: this._settings.useElectronNet,
        };

        if (method.opts['auth']) req.headers['Authorization'] = 'Bearer ' + this._authentication.access_token;

        for (let k in params) {
            if (k in req.body) req.body[k] = params[k];
        }
        for (let k in req.body) {
            if (!req.body[k]) delete req.body[k];
        }

        req.body = JSON.stringify(req.body);

        this._debug(req);
        return got(req.url, req).then(response => this._parseResponse(method, params, response));
    }

    // Parse trakt response: pagination & stuff
    _parseResponse (method, params, response) {
        if (!response.body) return response.body;

        const data = JSON.parse(response.body);
        let parsed = data;

        if (params && params.pagination) {
            parsed = {
                data: data
            };

            if (method.opts.pagination) {
                parsed.pagination = {
                    'item-count': response.headers['x-pagination-item-count'],
                    'limit': response.headers['x-pagination-limit'],
                    'page': response.headers['x-pagination-page'],
                    'page-count': response.headers['x-pagination-page-count'],
                };
            } else {
                parsed.pagination = false;
            }
        }

        return this._sanitize(parsed);
    }

    // Sanitize output (xss)
    _sanitize(input) {
        const sanitizeString = string => sanitizer(string);

        const sanitizeObject = obj => {
            const result = obj;
            for (let prop in obj) {
                result[prop] = obj[prop];
                if (obj[prop] && (obj[prop].constructor === Object || obj[prop].constructor === Array)) {
                    result[prop] = sanitizeObject(obj[prop]);
                } else if (obj[prop] && obj[prop].constructor === String) {
                    result[prop] = sanitizeString(obj[prop]);
                }
            }
            return result;
        }

        let output = input;
        if (input && (input.constructor === Object || input.constructor === Array)) {
            output = sanitizeObject(input);
        } else if (input && input.constructor === String) {
            output = sanitizeString(input);
        }

        return output;
    }

    // Get authentication url for browsers
    get_url() {
        this._authentication.state = crypto.randomBytes(6).toString('hex');
        // Replace 'api' from the api_url to get the top level trakt domain
        const base_url = this._settings.endpoint.replace('api.', '').replace('api-', '');
        return base_url + '/oauth/authorize?response_type=code&client_id=' + this._settings.client_id + '&redirect_uri=' + this._settings.redirect_uri + '&state=' + this._authentication.state;
    }

    // Verify code; optional state
    exchange_code(code, state) {
        if (state && state != this._authentication.state) throw Error('Invalid CSRF (State)');

        return this._exchange({
            code: code,
            client_id: this._settings.client_id,
            client_secret: this._settings.client_secret,
            redirect_uri: this._settings.redirect_uri,
            grant_type: 'authorization_code'
        });
    }

    // Get authentification codes for devices
    get_codes() {
        return this._device_code({
            client_id: this._settings.client_id
        }, 'code');
    }

    // Calling trakt on a loop until it sends back a token
    poll_access(poll) {
        if (!poll || (poll && poll.constructor !== Object)) throw Error('Invalid Poll object');

        const begin = Date.now();

        return new Promise((resolve, reject) => {
            const call = () => {
                if (begin + (poll.expires_in * 1000) <= Date.now()) {
                    clearInterval(polling);
                    return reject(Error('Expired'));
                }

                this._device_code({
                    code: poll.device_code,
                    client_id: this._settings.client_id,
                    client_secret: this._settings.client_secret
                }, 'token').then(body => {
                    this._authentication.refresh_token = body.refresh_token;
                    this._authentication.access_token = body.access_token;
                    this._authentication.expires = Date.now() + (body.expires_in * 1000); // Epoch in milliseconds

                    clearInterval(polling);
                    resolve(body);
                }).catch(error => {
                    // do nothing on 400
                    if (error.response && error.response.statusCode === 400) return;

                    clearInterval(polling);
                    reject(error);
                });
            };

            const polling = setInterval(() => {
                call();
            }, (poll.interval * 1000));
        });
    }

    // Refresh access token
    refresh_token() {
        return this._exchange({
            refresh_token: this._authentication.refresh_token,
            client_id: this._settings.client_id,
            client_secret: this._settings.client_secret,
            redirect_uri: this._settings.redirect_uri,
            grant_type: 'refresh_token'
        });
    }

    // Import token
    import_token(token) {
        this._authentication.access_token = token.access_token;
        this._authentication.expires = token.expires;
        this._authentication.refresh_token = token.refresh_token;

        return new Promise((resolve, reject) => {
            if (token.expires < Date.now()) {
                this.refresh_token().then(() => resolve(this.export_token())).catch(reject);
            } else {
                resolve(this.export_token());
            }
        });
    }

    // Export token
    export_token() {
        return {
            access_token: this._authentication.access_token,
            expires: this._authentication.expires,
            refresh_token: this._authentication.refresh_token
        };
    }

    // Revoke token
    revoke_token() {
        if (this._authentication.access_token) {
            this._revoke();
            this._authentication = {};
        }
    }
};
