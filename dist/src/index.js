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
    RapidProxy.setProxyURL3D = function (url) {
        RapidProxy.ProxyURL3D = url.replace(/\/$/, "");
    };
    RapidProxy.getProxyUrl3D = function () {
        return RapidProxy.ProxyURL3D;
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
    RapidProxy.generate = function (options, is3D) {
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
                urls[key] = (is3D ? RapidProxy.getProxyUrl3D() : RapidProxy.getProxyUrl()) + '/uid-' + uuid_1 + '/' + key + queryStr;
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
    RapidProxy.generate3D = function (options, is3D) {
        var o = JSON.parse(JSON.stringify(options));
        var keys = Object.keys(o.urls);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var index = o.urls[key].lastIndexOf("/tileset.json");
            o.urls[key] = o.urls[key].substring(0, index);
        }
        var rp = RapidProxy.generate(o, true);
        for (var _a = 0, keys_2 = keys; _a < keys_2.length; _a++) {
            var key = keys_2[_a];
            rp.urls[key] = rp.urls[key] + "/tileset.json";
        }
        return rp;
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
    RapidProxy.ProxyURL3D = "";
    return RapidProxy;
}());
exports.default = RapidProxy;
