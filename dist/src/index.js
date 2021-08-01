"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var RapidProxy = /** @class */ (function () {
    function RapidProxy() {
    }
    /**
     * Set the proxy url where the client will find the proxy at server side
     * @param url {link string}
     */
    RapidProxy.setProxyURL = function (url) {
        RapidProxy.ProxyURL = url.replace(/\/$/, "");
    };
    RapidProxy.getProxyUrl = function () {
        return RapidProxy.ProxyURL;
    };
    RapidProxy.setProxySecuredKey = function (key) {
        RapidProxy.ProxySecuredKey = key;
    };
    RapidProxy.getProxySecuredKey = function () {
        return RapidProxy.ProxySecuredKey;
    };
    /**
     * generate
     * @param options
     */
    RapidProxy.generate = function (options) {
        var Indexes = __assign({}, options.urls);
        Object.keys(Indexes).map(function (key, index) {
            Indexes[key] = Indexes[key].trim().split('?')[0];
        });
        var authorization = {};
        var useProxy = typeof options.useProxy !== 'undefined' ? options.useProxy : false;
        if (typeof options.authentication !== "undefined" && typeof options.authentication.type !== "undefined") {
            switch (options.authentication.type) {
                case "Basic":
                    authorization.type = options.authentication.type;
                    if (typeof options.authentication.token !== "undefined") {
                        authorization.value = options.authentication.token;
                    }
                    else {
                        var tok = options.authentication.username + ':' + options.authentication.password;
                        var hash = window.btoa(tok);
                        authorization.value = hash;
                    }
                    break;
                case "Bearer":
                    authorization.type = options.authentication.type;
                    authorization.value = options.authentication.token;
                    break;
                case "Vault":
                    authorization.type = options.authentication.type;
                    break;
            }
        }
        var securedKey = {};
        if (typeof RapidProxy.ProxySecuredKey !== "undefined")
            securedKey.key = RapidProxy.ProxySecuredKey;
        var myProxySettings = __assign(__assign({ urls: options.urls }, (useProxy ? { authorization: authorization } : {})), securedKey);
        var token = window.btoa(JSON.stringify(myProxySettings));
        var headers = options.requestHeaders ? __assign({}, options.requestHeaders) : {};
        var urls = __assign({}, options.urls);
        Object.keys(urls).map(function (key, index) {
            urls[key] = urls[key].trim();
        });
        if (useProxy) {
            var smartToken = RapidProxy.TokenKey + '=' + token;
            var acceptKey = typeof headers.accept !== "undefined" ? "accept" : "Accept";
            headers[acceptKey] = typeof headers[acceptKey] !== "undefined" ? smartToken + ';' + headers[acceptKey] : smartToken;
            RapidProxy.proxyCounter++;
            var uniqueID = RapidProxy.uuidv4();
            var uuid_1 = RapidProxy.proxyCounter + '-' + uniqueID;
            Object.keys(urls).map(function (key, index) {
                var urlParts = urls[key].split('?');
                var queryStr = urlParts.length > 1 ? '?' + urlParts[1] : '';
                urls[key] = RapidProxy.getProxyUrl() + '/uid-' + uuid_1 + '/' + key + queryStr;
            });
        }
        else {
            var authorizationKey = typeof headers.authorization !== "undefined" ? "authorization" : "Authorization";
            if (authorization.type === "Bearer" || authorization.type === "Basic") {
                headers[authorizationKey] = authorization.type + " " + authorization.value;
            }
        }
        return {
            urls: urls,
            headers: headers,
        };
    };
    RapidProxy.randomId = function () {
        return "" + Date.now();
    };
    RapidProxy.uuidv4 = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    RapidProxy.TokenKey = "token";
    RapidProxy.proxyCounter = 0;
    RapidProxy.ProxyURL = "";
    return RapidProxy;
}());
exports.default = RapidProxy;
