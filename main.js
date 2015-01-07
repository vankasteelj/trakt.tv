(function(exports){
    "use strict";
    var Q = require('q');
    var request = Q.denodeify(require('request'));
    var methods = require('./methods.json');

    var Trakt;
    var BASE_URL = 'https://api.trakt.tv';

    function Trakt(clientid, debug) {
        if (clientid == null) {
            throw new Error("No ClientID supplied for Trakt.");
        }
        this._debug = debug;
        this._clientid = clientid;
        this._construct();
    }

    var prototype = Trakt.prototype;
    prototype._construct = function(){
        var dis = this;
        for(var key in methods){
            var method = methods[key];
            var keyPath = key.split('/');
            var name = keyPath.pop();
            var currentObj = dis;
            for(var p=1; p<keyPath.length; ++p) {
                currentObj = currentObj[keyPath[p]] || (currentObj[keyPath[p]] = {});
            }
            currentObj[name] = function () {
                var methodData = method; // closure forces copy
                return function(data) {
                    return dis._apiCall(methodData, data);
                };
            }();
        }
    };

    prototype.setAccessToken = function setAccessToken(token) {
        this._token = token;
    }

    prototype._apiCall = function apiCall(method, data) {
        var url = '';
        if (method["up"] != null){
            var keyPath = method["url"].split('/');
            for(var p=1; p<keyPath.length; ++p) {
                if (method["up"].indexOf(keyPath[p]) == -1) url += '/' + keyPath[p];
                else if (data[keyPath[p]]) url += '/' + data[keyPath[p]];
                else if (method["defaults"][keyPath[p]]) url += '/' + method["defaults"][keyPath[p]];
                else if (!method["optional"][keyPath[p]])
                    throw "Missing data parameter " + keyPath[p];
            }
        }

        var opt = {
            method: method["method"],
            url: BASE_URL + url,
            headers: {
                'Content-type': 'application/json',
                'trakt-api-key': this._clientid,
                'trakt-api-version': 2
            }
        };

        if (method["opts"]["auth"] != false || this._debug){
            if (this._token) {
                opt.headers['Authorization'] = 'Bearer ' + this._token;
            } else if (method["opts"]["auth"] != "optional" && method["opts"]["auth"] != false) {
                throw "Missing auth!";
            }
        }

        if (method["jp"] != null){
            opt.body = {};
            for(var i=0;i<method["jp"].length;i++) {
                if (data[method["jp"][i]]) opt.body[method["jp"][i]] = data[method["jp"][i]];
                else if (method["defaults"][method["jp"][i]]) opt.body[method["jp"][i]] = method["defaults"][method["jp"][i]];
                else if (!method["optional"][method["jp"][i]])
                    throw "Missing data parameter " + method["jp"][i];
            }
            opt.body = JSON.stringify(opt.body);
        }
        if (method["qp"] != null){
            opt.form = {};
            for(var i=0;i<method["qp"].length;i++) {
                if (data[method["qp"][i]]) opt.form[method["qp"][i]] = data[method["qp"][i]];
                else if (method["defaults"][method["qp"][i]]) opt.form[method["qp"][i]] = method["defaults"][method["qp"][i]];
                else if (!method["optional"][method["qp"][i]])
                    throw "Missing data parameter " + method["qp"][i];
            }
        }

        if (method["opts"]["pagination"] != false){
            if (!opt.form) opt.form = {};
            if (data["page"]) opt.form["page"] = data["page"];
            if (data["limit"]) opt.form["limit"] = data["limit"];
        }

        return request(opt).then(function(it){
            it = it[0]; // it comes as an array, if so, select first.
            if (it.statusCode === 200) {
                return JSON.parse(it.body);
            } else {
                throw new Error('Unexpected status code: ' + it.statusCode);
            }
        });
    };

    module.exports = Trakt;
    return;
}());
