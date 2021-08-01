/// <reference types="jest" />
import { RapidProxyGenerateOptions } from "../src/index";
declare global {
    namespace jest {
        interface Matchers<R> {
            isProxyResult(i: RapidProxyGenerateOptions): CustomMatcherResult;
        }
    }
}
