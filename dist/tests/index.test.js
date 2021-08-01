"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = require('node-fetch');
var TEST_API = 'https://jsonplaceholder.typicode.com/todos/1';
var index_1 = __importDefault(require("../src/index"));
var links = {
    link1: "https://google.com",
    link2: "https://bing.com"
};
var headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
};
var MyProxyLocation = "http://localhost:8080/api/user/proxy";
var MySecretKey = "MySecretKey";
index_1.default.setProxyURL(MyProxyLocation);
index_1.default.setProxySecuredKey(MySecretKey);
expect.extend({
    isProxyResult: function (received, expected) {
        var status = true;
        var errMessage = "";
        var acceptHeader = received.headers["Accept"];
        var TokenKey = index_1.default.TokenKey + "=";
        if (acceptHeader.indexOf(TokenKey) > -1) {
            var items = acceptHeader.split(";");
            var targetItem = items.find(function (item) { return item.startsWith(TokenKey); });
            if (targetItem && typeof expected.requestHeaders !== "undefined") {
                if (acceptHeader !== targetItem + ";" + expected.requestHeaders["Accept"]) {
                    status = false;
                    errMessage = "Accept header didn't merge token with previous values";
                }
                else {
                    var code = targetItem.substr(TokenKey.length);
                    var jsonStr = window.atob(code);
                    var jsonObject = JSON.parse(jsonStr);
                    // console.log(jsonObject);
                }
            }
            else {
                status = false;
                errMessage = TokenKey + " missing in headers 2";
            }
            if (status) {
                if (received.urls) {
                    var keys = Object.keys(expected.urls);
                    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                        var key = keys_1[_i];
                        if (received.urls[key]) {
                            var link = received.urls[key];
                            if (link.startsWith(index_1.default.getProxyUrl()) && link.endsWith(key)) {
                                // OK test passed
                            }
                            else {
                                status = false;
                                errMessage = "Wrong proxy link format " + link;
                                break;
                            }
                        }
                        else {
                            status = false;
                            errMessage = "Missing urls " + key;
                            break;
                        }
                    }
                }
            }
        }
        else {
            status = false;
            errMessage = TokenKey + " missing in headers 1";
        }
        return {
            pass: status,
            message: function () { return errMessage; }
        };
    },
});
test('Test 1a: should set the url of the proxy at the backend', function () {
    expect(index_1.default.getProxyUrl()).toBe(MyProxyLocation);
});
test('Test 1b: should set the secret key of the proxy, it must match the key set at the backend', function () {
    expect(index_1.default.getProxySecuredKey()).toBe(MySecretKey);
});
test('Test 2: it should return unaltered headers and links', function () {
    expect(index_1.default.generate({
        useProxy: false,
        urls: links,
        requestHeaders: headers
    })).toStrictEqual({
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        "urls": {
            "link1": "https://google.com",
            "link2": "https://bing.com"
        }
    });
});
test('Test 3: it should return unaltered headers and links', function () {
    var inputOptions = {
        useProxy: false,
        urls: links,
        requestHeaders: headers,
        authentication: {
            type: "Basic",
            username: "admin",
            password: "admin"
        }
    };
    expect(index_1.default.generate(inputOptions)).toStrictEqual({
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Basic YWRtaW46YWRtaW4=",
        },
        "urls": {
            "link1": "https://google.com",
            "link2": "https://bing.com"
        }
    });
});
test('Test 4: it should return modified headers with proxy in Accept header', function () {
    var inputOptions = {
        useProxy: true,
        urls: links,
        requestHeaders: headers,
        authentication: {
            type: "Basic",
            username: "admin",
            password: "admin"
        }
    };
    expect(index_1.default.generate(inputOptions)).isProxyResult(inputOptions);
});
test('Test 4: it should return modified headers with proxy in Accept header', function () {
    var inputOptions = {
        useProxy: true,
        urls: links,
        requestHeaders: headers,
        authentication: {
            type: "Bearer",
            token: "somejwttoken"
        }
    };
    expect(index_1.default.generate(inputOptions)).isProxyResult(inputOptions);
});
test('Test 5: Test against dummy API ' + TEST_API, function () {
    var inputOptions = {
        useProxy: false,
        urls: {
            link1: TEST_API
        },
        requestHeaders: {
            Accept: "application/json"
        }
    };
    var proxy = index_1.default.generate(inputOptions);
    return fetch(proxy.urls.link1, {
        headers: proxy.headers
    })
        .then(function (response) {
        expect(response.status).toBe(200);
        if (response.status === 200) {
            response.json().then(function (json) {
                expect(json).toStrictEqual(JSON.parse("{\"completed\": false, \"id\": 1, \"title\": \"delectus aut autem\", \"userId\": 1}"));
            });
        }
    });
});
test('Test 6: Test against dummy API localhost proxy to reach ' + TEST_API, function () {
    var inputOptions = {
        useProxy: true,
        urls: {
            link1: TEST_API
        },
        requestHeaders: {
            Accept: "application/json"
        }
    };
    var proxy = index_1.default.generate(inputOptions);
    return fetch(proxy.urls.link1, {
        headers: proxy.headers
    })
        .then(function (response) {
        expect(response.status).toBe(200);
        if (response.status === 200) {
            response.json().then(function (json) {
                expect(json).toStrictEqual(JSON.parse("{\"completed\": false, \"id\": 1, \"title\": \"delectus aut autem\", \"userId\": 1}"));
            });
        }
    });
});
