type RapidProxyAuthenticationType = "Basic" | "Bearer" | "Vault";

interface RapidProxyAuthentication {
   type: RapidProxyAuthenticationType;
   "username"?: string;
   "password"?: string;
    "token"?: string;
}

interface RapidProxyEndpoints {
    urls: { [p: string]: string };
    headers: { [p: string]: string };
}

interface RapidProxyGenerateOptions {
    urls: { [key: string]: string };
    useProxy: boolean;
    requestHeaders?: { [key: string]: string };
    authentication?: RapidProxyAuthentication;
}

class RapidProxy {
    public static TokenKey = "token";
    private static proxyCounter = 0;
    private static ProxyURL: string = "";
    private static ProxySecuredKey: string;

    /**
     * Set the proxy url where the client will find the proxy at server side
     * @param url {link string}
     */
    public static setProxyURL(url: string) {
        RapidProxy.ProxyURL = url.replace(/\/$/, "");
    }

    public static getProxyUrl() {
        return RapidProxy.ProxyURL;
    }

    public static setProxySecuredKey(key: string) {
        RapidProxy.ProxySecuredKey = key;
    }

    public static getProxySecuredKey() {
        return RapidProxy.ProxySecuredKey;
    }

    /**
     * generate
     * @param options
     */
    static generate(options: RapidProxyGenerateOptions): RapidProxyEndpoints {
        const Indexes = { ...options.urls };
        Object.keys(Indexes).map((key, index) => {
            Indexes[key] = Indexes[key].trim().split('?')[0];
        });
        let authorization = {} as any;

        const useProxy = typeof options.useProxy !== 'undefined' ? options.useProxy : false;
        if (typeof options.authentication !== "undefined" && typeof options.authentication.type !== "undefined") {
            switch (options.authentication.type) {
                case "Basic":
                      authorization.type = options.authentication.type;
                      if (typeof options.authentication.token !== "undefined") {
                          authorization.value = options.authentication.token;
                      } else {
                          const tok = options.authentication.username + ':' + options.authentication.password;
                          const hash = window.btoa(tok);
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

        const securedKey = {} as any;
        if (typeof RapidProxy.ProxySecuredKey !== "undefined") securedKey.key = RapidProxy.ProxySecuredKey;
        const myProxySettings = {
            urls: options.urls,
            ...(useProxy ? {authorization}: {}),
            ...securedKey
        };
        const token = window.btoa(JSON.stringify(myProxySettings));
        const headers = options.requestHeaders ? { ...options.requestHeaders } : {};

        const urls = { ...options.urls };
        Object.keys(urls).map((key, index) => {
            urls[key] = urls[key].trim();
        });
        if (useProxy) {
            const smartToken = RapidProxy.TokenKey + '=' + token;
            const acceptKey = typeof headers.accept !== "undefined" ? "accept" : "Accept";
            headers[acceptKey] = typeof headers[acceptKey] !== "undefined"? smartToken + ';' + headers[acceptKey] : smartToken;

            RapidProxy.proxyCounter++;
            Object.keys(urls).map((key, index) => {
                const uuid = RapidProxy.proxyCounter + '-' + RapidProxy.uuidv4();
                const urlParts = urls[key].split('?');
                const queryStr = urlParts.length > 1 ? '?' + urlParts[1] : '';
                urls[key] = RapidProxy.getProxyUrl() + '/uid-' + uuid + '/' + key + queryStr;
            });
        } else {
            const authorizationKey = typeof headers.authorization !== "undefined" ? "authorization" : "Authorization";
            if (authorization.type === "Bearer" || authorization.type === "Basic") {
                headers[authorizationKey] = authorization.type + " " + authorization.value;
            }
        }
        return {
            urls,
            headers,
        };
    }

    private static randomId(): string {
        return "" + Date.now();
    }

    private static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}

export default RapidProxy;

export {
    RapidProxyAuthentication,
    RapidProxyEndpoints,
    RapidProxyGenerateOptions
}
