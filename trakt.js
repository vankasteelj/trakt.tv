(function(exports){
    "use strict";
    var Q = require('q');
    var request = Q.denodeify(require('request'));
    var crypto = require('crypto');
    var reqs = require('./methods.json');

    var Trakt;
    var BASE_URL = "https://api-v2launch.trakt.tv";

    function Trakt(settings, debug) {
      this._client_id = settings.client_id;
      this._client_secret = settings.client_secret;
      this._redirect_uri = settings.redirect_uri ? settings.redirect_uri : "urn:ietf:wg:oauth:2.0:oob";

      this._debug = debug;
      if (debug && settings.api_url) BASE_URL = settings.api_url;

      if (!this._client_id || !this._client_secret)
        throw new Error("Missing client credentials");

      this._construct();
      return this;
    }

    var prototype = Trakt.prototype;

    prototype._printRequest = function printReq(req) {
      if (!this._debug) return;
      var out = "";
      if (req.headers["Authorization"]) out += "(AUTHED) ";

      out += req.method + ": ";
      out += req.url;
      console.log(out);
    };

    /**
     * Creates methods for all requests
     */
    prototype._construct = function construct() {
      var rThis = this;
      for(var url in reqs) {
        var urlParts = url.split('/');
        var name = urlParts.pop(); // key for function

        var currentObj = rThis;
        for(var p=1; p < urlParts.length; ++p) {
          // Recursively walk down tree until last part is hit
          // create missing {} if needed (acts like mkdir -p)
          currentObj = currentObj[urlParts[p]] || (currentObj[urlParts[p]] = {});
        }

        currentObj[name] = function () {
            var method = reqs[url]; // closure forces copy
            return function(params, callback) {
                return rThis._apiCall(method, params, callback);
            };
        }();
      }
    };

    prototype._authRequest = function authRequest(req) {
      var rThis = this;
      rThis._printRequest(req);
      return request(req)
        .then(function(it) {
          if (it[0].statusCode == 200) {
            var body = JSON.parse(it[0].body);
            rThis._refreshToken = body.refresh_token;
            rThis._accessToken = body.access_token;
            rThis._tokenExpires = Date.now() + body.expires_in;
          }
          return it;
        })
        .then(function(it){
          if (it[0].statusCode == 401) return it[0].headers["www-authenticate"];
          else if (it[0].statusCode == 200) return true;
          else throw new Error("Unexpected statusCode: " + it[0].statusCode);
          return false;
        });
    };

    prototype.authUrl = function() {
      this._authState = crypto.randomBytes(6).toString('hex');
      return "https://trakt.tv/oauth/authorize?response_type=code&client_id="
        + this._client_id
        + "&redirect_uri=" + this._redirect_uri
        + "&state=" + this._authState;
    };

    prototype.authorizeCode = function authorizeCode(code, state) {
      if (state && state != this._authState)
        throw new Error("Invalid CSRF (State)");

      return this._authRequest({
        method: 'POST',
        url: BASE_URL + "/oauth/token",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          client_id: this._client_id,
          client_secret: this._client_secret,
          redirect_uri: this._redirect_uri,
          grant_type: "authorization_code"
        })
      });
    };
    prototype.authorizePin = prototype.authorizeCode;

    prototype.refreshToken = function refreshToken() {
      return this._authRequest({
        method: 'POST',
        url: BASE_URL + "/oauth/token",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: this._refresh_token,
          client_id: this._client_id,
          client_secret: this._client_secret,
          redirect_uri: this._redirect_uri,
          grant_type: "authorization_code"
        })
      });
    };

    prototype.setAccessToken = function setAccessToken(token) {
      this._accessToken = token.access_token;
      this._tokenExpires = token.expires;
      this._refreshToken = token.refresh_token;
      return this;
    };

    prototype.serializeToken = function serializeToken() {
      return {
        access_token: this._accessToken,
        expires: this._tokenExpires,
        refresh_token: this._refreshToken
      };
    };

    prototype._parseUrl = function _parseUrl(method, params) {
      var url = method.url;
      var queryParts = [];
      var pathParts = [];

      if (!params) params = {};

      // Pagination
      if (method.opts["pagination"] && params["page"]) {
        queryParts.push("page=" + params["page"]);
        if (params["limit"]) queryParts.push("limit=" + params["limit"]);
      }

      // Extended
      if (params["extended"]) queryParts.push("extended=" + params["extended"]);

      // ?Part
      var queryPart = url.split('?')[1];
      if (queryPart) {
        var queryParams = queryPart.split('&');
        for(var i in queryParams) {
          var name = queryParams[i].split('=')[0];
          if (params[name]) queryParts.push(name + "=" + params[name]);
        }
      }

      // /part
      var pathPart = url.split('?')[0];
      var pathParams = pathPart.split('/');
      for(var k in pathParams) {
        if (pathParams[k][0] != ":") pathParts.push(pathParams[k]);
        else {
          var param = params[pathParams[k].substr(1)];
          if (param) pathParts.push(param);
        }
      }

      var url = BASE_URL + pathParts.join('/');
      if (queryParts.length) url += "?" + queryParts.join('&');
      return url;
    };

    prototype._apiCall = function apiCall(method, params) {
      var rThis = this;

      if (method.opts["auth"] === true && !rThis._accessToken)
        throw new Error("Auth required");

      var req = {
        method: method.method,
        url: rThis._parseUrl(method, params),
        headers: {
          'Content-Type': 'application/json',
          'trakt-api-version': '2',
          'trakt-api-key': rThis._client_id
        },
        body: (method.body ? method.body : {})
      };

      if (method.opts["auth"]) {
        req.headers['Authorization'] = 'Bearer ' + rThis._accessToken;
      }

      for(var k in params) if (k in req.body) req.body[k] = params[k];
      for(var k in req.body) if (!req.body[k]) delete req.body[k];

      req.body = JSON.stringify(req.body);

      rThis._printRequest(req);
      return request(req).then(function(it){
        it = it[0]; // it comes as an array, if so, select first.
        if (it.statusCode == 200) {
          return JSON.parse(it.body);
        } else {
          throw it.error;
        }
      });
    };

    module.exports = Trakt;
    return;
}());
