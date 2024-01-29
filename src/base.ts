import {EventSource} from "./events";
import { STATUS_CODES } from 'http';
import * as assert from "assert";
import {Logger} from "./utils";

export interface EmpationAPIOptions {
    workbenchApiUrl: string;
    apiRootPath?: string;
}

export interface RawOptions {
    body?: object | string;
    query?: any;
    method?: string;
    headers?: object;
}

//https://gist.github.com/TooTallNate/4fd641f820e1325695487dfd883e5285
function httpErrorToName(code): string {
    const suffix = (code / 100 | 0) === 4 || (code / 100 | 0) === 5 ? 'error' : '';
    let name = ` ${String(STATUS_CODES[code]).replace(/error$/i, '')} ${suffix}`;
    return name.split(" ").reduce((acc, c) => acc
        + (c ? (c.charAt(0).toUpperCase() + c.slice(1)) : ""));
}

export class HTTPError extends Error {

    statusCode: number;
    [key: string]: any

    public constructor(code: number, message: string, extras?: Record<string, any>) {
        super(message || STATUS_CODES[code]);
        if (arguments.length >= 3 && extras) {
            // noinspection TypeScriptValidateTypes
            Object.assign(this, extras);
        }
        this.name = httpErrorToName(code);
        this.statusCode = code;
    }
}

export interface HttpQueueItem extends RawOptions {
    url: string
}

export interface ConnectionErrorEventArgs {
    queue: Array<HttpQueueItem>;
    retryCount: number;
    maxRetryCount: number;
    nextRetryInMs: number;
}

export type ConnectionErrorEvent = (args: ConnectionErrorEventArgs) => void | Promise<void>;

export class RawAPI {
    public url: string;
    private _queue: Array<HttpQueueItem> = [];
    private _handler: ConnectionErrorEvent;
    private _retryRoutine: NodeJS.Timeout;
    private _running: boolean = true;

    //todo params
    public maxRetryCount: 5;
    public timeout: number | Array<number> = [5000, 10000, 20000, 30000];

    constructor(url: string, errorHandler: ConnectionErrorEvent) {
        this.url = url;
        this._handler = errorHandler;
    }

    private _parseQueryParams(params) {
        if (params) {
            if (typeof params === "string") return params;

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

    private _setRetryIn(retryCount, retryTimeout) {
        if (retryCount >= this.maxRetryCount) {
            Logger.error("Automated retry failed: maxRetryCount exceeded!");
        } else {
            this._retryRoutine = setTimeout(this._replay.bind(this, retryCount), retryTimeout);
        }
        this._running = false;
        this._handler({
            queue: this._queue,
            retryCount: retryCount,
            maxRetryCount: this.maxRetryCount,
            nextRetryInMs: retryTimeout
        });
    }

    private _recordFailed(url: string, options: RawOptions, retryCount, retryTimeout) {
        if (this._running) {
            this._setRetryIn(retryCount, retryTimeout);
        }
        this._queue.push({url, ...options});
    }

    private async _replay(retryCount=0) {
        if (!this._queue) {
            this._running = true;
            return;
        }
        if (this._retryRoutine) {
            clearTimeout(this._retryRoutine);
            this._retryRoutine = null;
        }
        try {
            const item = this._queue[0];
            await this._fetch(item.url, item);
            this._queue.shift();
        } catch (e) {
            retryCount++;
            // index 0 == 1st replay attempt
            Logger.warn("Replay attempt ", retryCount, " failed: ", e);
            const retryTimeout = Array.isArray(this.timeout) ?
                this.timeout[Math.min(this.timeout.length-1, retryCount)] : this.timeout;
            this._setRetryIn(retryCount, retryTimeout);
            throw e;
        }
        await this._replay();
    }

    private async _fetch(url: string, options: RawOptions | HttpQueueItem): Promise<any> {
        const response = await fetch(url, {
            method: options.method,
            headers: options.headers,
            body: options.body
        } as RequestInit);

        let result;
        try {
            result = await response.json();
        } catch (e) {
            throw new HTTPError(500,
                `Failed to parse response data. Original status: ${response.status} | ${response.statusText}`,
                {
                    url: url,
                    error: e
                });
        }

        if (!response.ok) {
            throw new HTTPError(response.status, response.statusText, result);
        }
        return result;
    }

    async http(endpoint: string, options: RawOptions): Promise<any> {
        const hasBody = !!options.body;
        options.method = options.method || (hasBody ? "POST" : "GET");
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        options.query = this._parseQueryParams(options.query);
        options.headers = options.headers || {};
        options.headers['Content-Type'] = "application/json";
        if (options.body && typeof options.body !== "string") {
            options.body = JSON.stringify(options.body);
        } else options.body = null;

        let err = null;
        try {
            if (this._running) {
                return await this._fetch(this.url + endpoint + options.query, options);
            }
        } catch (e) {
            err = e;
        }

        if (Array.isArray(this.timeout) && this.timeout.length < 1) this.timeout = [5000];
        else if (!this.timeout) this.timeout = 5000;
        const timeout = Array.isArray(this.timeout) ? this.timeout[0] : this.timeout;
        this._recordFailed(this.url + endpoint + options.query, options, 0, timeout);

        if (err) throw err;
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
