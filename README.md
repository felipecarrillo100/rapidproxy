# rapidproxy
A smart and easy to use Ajax proxy for Javascript applications.

## Background
Applications that run in a web browser may experience some restrictions when accessing remote servers. For instence:
* CORS issues
* Access a http server from a https application

A simple solution to these issues is to send the request through a proxy.
```
Web browser ==> Proxy Server ==> Target Server
```

The "Proxy Server" can be implemented in the programing language of your choice. For instance: PHP, NodeJS or Java.
A Java implementation is available as a Maven library that you can easily add in to your projects, more info at this link:
https://github.com/felipecarrillo100/rapidproxyserver

## How to install:
npm install RapidProxy

## How to include
```javascript
import RapidProxy from "rapidproxy";
```

## To use
### Configure it first
Set the location of the proxy in your server: 
```javascript
RapidProxy.setProxyURL("location_of_your_proxy_server");  
```  

### Generate proxy (generate urls and headers to use in AJAX calls):
Use the "RapidProxy.generate" method to create the proxyfyed urls and headers. 
* urls: Is an object containing a list of urls that require proxy urls: {[key: string]: string}
* requestHeaders: The list of headers to append to the AJAX call. Do not add Authentication, this is generated automatically.
* useProxy: boolean value, if false no proxy is used, urls are called directly; if true proxy is used 

```javascript
const inputOptions: RapidProxyGenerateOptions = {
    useProxy: true,
    urls: {
        // Add more urls if needed the key can have any name, in this case link1, you will use the key to invocque the proxyfyed link
        link1: "https://jsonplaceholder.typicode.com/todos/1",
        link2: "https://some.other.server/address",
    },
    requestHeaders: {
        // Add any headers you want to pass
        Accept: "application/json"
    }
};

const proxy = RapidProxy.generate(inputOptions);
// proxy will contains a list of proxyfied links and headers
// proxy.urls  list of links to use in the AJAX requests.
// proxy.headersa list of headers to pass on each ajax request
```
You are done!  Now you can perform AJAX calls through your PROXY server!

### Making an AJAX request
This example shows the use with "fetch", but you can use any AJAX library as long as it supports passing headers

```javascript
// We use the link1 that in this example correspondes to "https://jsonplaceholder.typicode.com/todos/1"
return fetch(proxy.urls.link1, {
    headers: proxy.headers
})
    .then((response: any) => {
        if (response.status === 200) {
            response.json().then((json:any) => {
                console.log(json)
            });
        }
    })
```

## More complex examples with authentication
### With basic authentication
For Basic Authentication username and password are encoded to a base64 hash,  Authentication: Basic <bas64-hash>

```javascript
const inputOptions: RapidProxyGenerateOptions = {
    useProxy: true,
    urls: {
        // Add more urls if needed, the keys can have any name, in this case link1, you will use the key to invocque the proxyfyed link
        link1: "https://jsonplaceholder.typicode.com/todos/1",
        link2: "https://some.other.server/address",
    },
    requestHeaders: {
        // Add all headers you want to pass, except for Authentication that is automatically generated
        Accept: "application/json"
    },
    authentication: {
        type: "Basic",
        username: "admin",
        password: "admin"
    }
};

const proxy = RapidProxy.generate(inputOptions);
```

### With bearer authentication
Authentication is passed with a bearer, for instance a jwt token: Authentication: Bearer <some-token>

```javascript
const inputOptions: RapidProxyGenerateOptions = {
    useProxy: true,
    urls: {
        link1: "https://jsonplaceholder.typicode.com/todos/1",
        link2: "https://some.other.server/address",
    },
    requestHeaders: {
        Accept: "application/json"
    },
    authentication: {
        type: "Bearer",
        token: "sometokenvalu"
    }
};

const proxy = RapidProxy.generate(inputOptions);
```

### With vault authentication. 
No credentials will be  passed, we assumed the server already has the credentials stored in a vault

```javascript
const inputOptions: RapidProxyGenerateOptions = {
    useProxy: true,
    urls: {
        link1: "https://jsonplaceholder.typicode.com/todos/1",
        link2: "https://some.other.server/address",
    },
    requestHeaders: {
        Accept: "application/json"
    },
    authentication: {
        type: "Vault"
    }
};

const proxy = RapidProxy.generate(inputOptions);
```

## Using a key to secure your proxy server

Optionally, you can set a secret key at your proxy server.  Your client needs to know and pass the same key, if the key in the client does not match with the key in the server the request will be rejected.

```javascript
// Set your key before generating any proxys, key must match with what the key have set in your server
RapidProxy.setProxySecuredKey("MySecretKey");

// Once the secured key has been set, you can generate proxies as usual
const proxy = RapidProxy.generate(inputOptions);
```
