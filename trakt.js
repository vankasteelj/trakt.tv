(function(exports){
    "use strict";
    var got = require('got');
    var crypto = require('crypto');
    var reqs = require('./methods.json');

    var Trakt;
    var URI = "https://api-v2launch.trakt.tv";

    function Trakt(settings, debug) {
      this._authentication = {};
      this._settings = {
          client_id: settings.client_id,
          client_secret: settings.client_secret,
          redirect_uri: settings.redirect_uri ? settings.redirect_uri : "urn:ietf:wg:oauth:2.0:oob",
          debug: debug === true ? true : false,
          endpoint: debug && settings.api_url ? settings.api_url : URI
      };

      if (!this._settings.client_id || !this._settings.client_secret)
        throw new Error("Missing client credentials");

      this._construct();
      return this;
    }

    var prototype = Trakt.prototype;

    prototype._printRequest = function printReq(req) {
      if (!this._settings.debug) return;
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
      return got(req.url, req)
        .then(function(response) {
          var body = JSON.parse(response.body);
          rThis._authentication.refresh_token = body.refresh_token;
          rThis._authentication.access_token = body.access_token;
          rThis._authentication.expires = Date.now() + body.expires_in;
          return body;
        })
        .catch(function(error){
          if (error.response.statusCode == 401) {
            throw new Error(error.response.headers["www-authenticate"]);
          } else {
            throw new Error(error);
          }
        });
    };

    prototype.authUrl = function() {
      this._authentication.state = crypto.randomBytes(6).toString('hex');
      return "https://trakt.tv/oauth/authorize?response_type=code&client_id="
        + this._client_id
        + "&redirect_uri=" + this._settings.redirect_uri
        + "&state=" + this._authentication.state;
    };

    prototype.authorizeCode = function(code, state) {
      if (state && state != this._authentication.state)
        throw new Error("Invalid CSRF (State)");

      return this._authRequest({
        method: 'POST',
        url: this._settings.endpoint + "/oauth/token",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          client_id: this._settings.client_id,
          client_secret: this._settings.client_secret,
          redirect_uri: this._settings.redirect_uri,
          grant_type: "authorization_code"
        })
      });
    };

    prototype.refreshToken = function refreshToken() {
      return this._authRequest({
        method: 'POST',
        url: this._settings.endpoint + "/oauth/token",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: this._authentication.refresh_token,
          client_id: this._settings.client_id,
          client_secret: this._settings.client_secret,
          redirect_uri: this._settings.redirect_uri,
          grant_type: "authorization_code"
        })
      });
    };

    prototype.setAccessToken = function setAccessToken(token) {
      this._authentication.access_token = token.access_token;
      this._authentication.expires = token.expires;
      this._authentication.refresh_token = token.refresh_token;
      return this;
    };

    prototype.serializeToken = function serializeToken() {
      var rthis = this;
      return {
        access_token: rthis._authentication.access_token,
        expires: rthis._authentication.expires,
        refresh_token: rthis._authentication.refresh_token
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

      var url = this._settings.endpoint + pathParts.join('/');
      if (queryParts.length) url += "?" + queryParts.join('&');
      return url;
    };

    prototype._apiCall = function apiCall(method, params) {
      var rThis = this;

      if (method.opts["auth"] === true && !rThis._authentication.access_token)
        throw new Error("Auth required");

      var req = {
        method: method.method,
        url: rThis._parseUrl(method, params),
        headers: {
          'Content-Type': 'application/json',
          'trakt-api-version': '2',
          'trakt-api-key': rThis._settings.client_id
        },
        body: (method.body ? method.body : {})
      };

      if (method.opts["auth"]) {
        req.headers['Authorization'] = 'Bearer ' + rThis._authentication.access_token;
      }

      for(var k in params) if (k in req.body) req.body[k] = params[k];
      for(var k in req.body) if (!req.body[k]) delete req.body[k];

      req.body = JSON.stringify(req.body);

      rThis._printRequest(req);
      return got(req.url, req).then(function(response) {
        return JSON.parse(response.body);
      });
    };

    module.exports = Trakt;
    return;
}());
