import {EventSource} from "./events";
import retryTimes = jest.retryTimes;

export interface EmpationAPIOptions {
    workbenchApiUrl: string;
    apiRootPath?: string;
}

export interface RawOptions {
    body?: object;
    query?: any;
    method?: string;
    headers?: object;
}

export class RawAPI {

    url: string;

    constructor(url) {
        this.url = url;
    }

    private _parseQueryParams(params) {
        if (params) {
            //cleanup plain objects
            if (params.constructor === Object || params.constructor === undefined) {
                for (let k in params) {
                    const v = params[k];
                    if (v === null || v === undefined || v == "") delete params[k];
                }

            }
            return `?${new URLSearchParams(params)}`;
        }
        return "";
    }

    async http(endpoint: string, options: RawOptions): Promise<any> {
        const hasBody = !!options.body;
        const method = options.method || (hasBody ? "POST" : "GET");
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        let queryParams = this._parseQueryParams(options.query);
        options.headers = options.headers || {};
        options.headers['Content-Type'] = "application/json";
        const initParams = {
            method: method,
            headers: options.headers,
            body: hasBody ? JSON.stringify(options.body) : null
        } as RequestInit;
        const url = this.url + endpoint + queryParams;
        const response = await fetch(url, initParams);
        let result;
        try {
            result = await response.json();
        } catch (e) {
            throw `Raw HTTP: '${url}': failed to parse response data. Status: ${response.status} | ${response.statusText}`;
        }

        //todo consider better parsing of the reponse error
        if (!response.ok) {
            const data = result.detail || result;
            throw `Raw HTTP: '${url}': ${typeof data === "object" ? JSON.stringify(data) : data}`;
        }
        return result;
    }
}

//todo consider implementing 'observe' method that registers and watches certain property list..
export class AbstractAPI extends EventSource {
    //todo try figuring out how to print the class name too
    //https://stackoverflow.com/questions/280389/how-do-you-find-out-the-caller-function-in-javascript
    private getCallerName() {
        // Get stack array
        const orig = Error.prepareStackTrace;
        Error.prepareStackTrace = (error, stack) => stack;
        const { stack } = new Error();
        Error.prepareStackTrace = orig;

        const caller = stack[2];
        return caller ? caller : 'unknown context';
    }

    requires(name, value): void {
        if (!value) {
            throw `ArgumentError[${this.getCallerName()}] ${name} is missing - required property!`
        }
    }
}
