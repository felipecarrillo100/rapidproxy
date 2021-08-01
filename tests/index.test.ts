const fetch = require('node-fetch');

const TEST_API = 'https://jsonplaceholder.typicode.com/todos/1';

import RapidProxy, {RapidProxyEndpoints, RapidProxyGenerateOptions} from "../src/index";

const links = {
    link1: "https://google.com",
    link2: "https://bing.com"
}
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
}

const MyProxyLocation = "http://localhost:8080/api/user/proxy";
const MySecretKey = "MySecretKey";

RapidProxy.setProxyURL(MyProxyLocation);
RapidProxy.setProxySecuredKey(MySecretKey)

expect.extend({
    isProxyResult(received: RapidProxyEndpoints, expected: RapidProxyGenerateOptions) {
        let status = true;
        let errMessage = "";
        const acceptHeader = received.headers["Accept"];
        const TokenKey = RapidProxy.TokenKey+"=";
        if (acceptHeader.indexOf(TokenKey) > -1) {
            const items = acceptHeader.split(";");
            const targetItem = items.find((item) => item.startsWith(TokenKey));
            if (targetItem && typeof expected.requestHeaders !== "undefined") {
                if (acceptHeader !== targetItem + ";" + expected.requestHeaders["Accept"]) {
                    status = false;
                    errMessage = "Accept header didn't merge token with previous values";
                } else {
                    const code = targetItem.substr(TokenKey.length);
                    const jsonStr = window.atob(code);
                    const jsonObject = JSON.parse(jsonStr);
                    // console.log(jsonObject);
                }
            } else {
                status = false;
                errMessage = TokenKey + " missing in headers 2";
            }
            if (status) {
                if (received.urls) {
                    const keys = Object.keys(expected.urls);
                    for (const key of keys) {
                        if (received.urls[key]) {
                            const link = received.urls[key];
                            if (link.startsWith(RapidProxy.getProxyUrl()) && link.endsWith(key)) {
                                // OK test passed
                            } else {
                                status = false;
                                errMessage = "Wrong proxy link format " + link;
                                break;
                            }
                        } else {
                            status = false;
                            errMessage = "Missing urls " + key
                            break;
                        }
                    }
                }
            }
        } else {
            status = false;
            errMessage = TokenKey + " missing in headers 1";
        }

        return {
            pass: status,
            message: () => errMessage
        };
    },
});

declare global {
    namespace jest {
        interface Matchers<R> {
            isProxyResult(i: RapidProxyGenerateOptions): CustomMatcherResult;
        }
    }
}

test('Test 1a: should set the url of the proxy at the backend', () => {
    expect(RapidProxy.getProxyUrl()).toBe(MyProxyLocation);
})

test('Test 1b: should set the secret key of the proxy, it must match the key set at the backend', () => {
    expect(RapidProxy.getProxySecuredKey()).toBe(MySecretKey);
})


test('Test 2: it should return unaltered headers and links', () => {
    expect(RapidProxy.generate({
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
})

test('Test 3: it should return unaltered headers and links', () => {
    const inputOptions: RapidProxyGenerateOptions = {
        useProxy: false,
        urls: links,
        requestHeaders: headers,
        authentication: {
            type: "Basic",
            username: "admin",
            password: "admin"
        }
    };
    expect(RapidProxy.generate(inputOptions)).toStrictEqual(
        {
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
})



test('Test 4: it should return modified headers with proxy in Accept header', () => {

    const inputOptions: RapidProxyGenerateOptions = {
        useProxy: true,
        urls: links,
        requestHeaders: headers,
        authentication: {
            type: "Basic",
            username: "admin",
            password: "admin"
        }
    };
    expect(RapidProxy.generate(inputOptions)).isProxyResult(inputOptions)

})

test('Test 4: it should return modified headers with proxy in Accept header', () => {

    const inputOptions: RapidProxyGenerateOptions = {
        useProxy: true,
        urls: links,
        requestHeaders: headers,
        authentication: {
            type: "Bearer",
            token: "somejwttoken"
        }
    };
    expect(RapidProxy.generate(inputOptions)).isProxyResult(inputOptions)
})

test('Test 5: Test against dummy API ' + TEST_API, () => {
    const inputOptions: RapidProxyGenerateOptions = {
        useProxy: false,
        urls: {
            link1: TEST_API
        },
        requestHeaders: {
            Accept: "application/json"
        }
    };

    const proxy = RapidProxy.generate(inputOptions);

    return fetch(proxy.urls.link1, {
        headers: proxy.headers
    })
        .then((response: any) => {
            expect(response.status).toBe(200);
            if (response.status === 200) {
                response.json().then((json:any) => {
                    expect(json).toStrictEqual( JSON.parse("{\"completed\": false, \"id\": 1, \"title\": \"delectus aut autem\", \"userId\": 1}"));
                });
            }
        })
});

test('Test 6: Test against dummy API localhost proxy to reach ' + TEST_API, () => {
    const inputOptions: RapidProxyGenerateOptions = {
        useProxy: true,
        urls: {
            link1: TEST_API
        },
        requestHeaders: {
            Accept: "application/json"
        }
    };

    const proxy = RapidProxy.generate(inputOptions);


    return fetch(proxy.urls.link1, {
        headers: proxy.headers
    })
        .then((response: any) => {
            expect(response.status).toBe(200);
            if (response.status === 200) {
                response.json().then((json:any) => {
                    expect(json).toStrictEqual( JSON.parse("{\"completed\": false, \"id\": 1, \"title\": \"delectus aut autem\", \"userId\": 1}"));
                });
            }
        })
});


