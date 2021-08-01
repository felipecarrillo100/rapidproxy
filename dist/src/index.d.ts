declare type RapidProxyAuthenticationType = "Basic" | "Bearer" | "Vault";
interface RapidProxyAuthentication {
    type: RapidProxyAuthenticationType;
    "username"?: string;
    "password"?: string;
    "token"?: string;
}
interface RapidProxyEndpoints {
    urls: {
        [p: string]: string;
    };
    headers: {
        [p: string]: string;
    };
}
interface RapidProxyGenerateOptions {
    urls: {
        [key: string]: string;
    };
    useProxy: boolean;
    requestHeaders?: {
        [key: string]: string;
    };
    authentication?: RapidProxyAuthentication;
}
declare class RapidProxy {
    static TokenKey: string;
    private static proxyCounter;
    private static ProxyURL;
    private static ProxySecuredKey;
    /**
     * Set the proxy url where the client will find the proxy at server side
     * @param url {link string}
     */
    static setProxyURL(url: string): void;
    static getProxyUrl(): string;
    static setProxySecuredKey(key: string): void;
    static getProxySecuredKey(): string;
    /**
     * generate
     * @param options
     */
    static generate(options: RapidProxyGenerateOptions): RapidProxyEndpoints;
    private static randomId;
    private static uuidv4;
}
export default RapidProxy;
export { RapidProxyAuthentication, RapidProxyEndpoints, RapidProxyGenerateOptions };
